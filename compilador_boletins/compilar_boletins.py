from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

import pdfplumber
from pypdf import PdfReader, PdfWriter


COMPONENT_ALIASES = {
    "Lingua Portuguesa": ["lingua portuguesa", "língua portuguesa", "portugues", "português", "lp"],
    "Matematica": ["matematica", "matemática"],
    "Historia": ["historia", "história"],
    "Geografia": ["geografia"],
    "Ciencias": ["ciencias", "ciências"],
    "Arte": ["arte", "artes"],
    "Educacao Fisica": ["educacao fisica", "educação física", "ed fisica", "ed. fisica"],
    "Ingles": ["ingles", "inglês", "lingua inglesa", "língua inglesa"],
    "Ensino Religioso": ["ensino religioso", "religiao", "religião"],
    "Projeto de Vida": ["projeto de vida"],
    "Espanhol": ["espanhol"],
    "Fisica": ["fisica", "física"],
    "Quimica": ["quimica", "química"],
    "Biologia": ["biologia"],
    "Filosofia": ["filosofia"],
    "Sociologia": ["sociologia"],
    "Redacao": ["redacao", "redação", "produção textual", "producao textual"],
    "Literatura": ["literatura"],
    "Alfabetizacao": ["alfabetizacao", "alfabetização"],
    "Leitura": ["leitura"],
    "Escrita": ["escrita"],
}

STUDENT_NAME_PATTERNS = [
    re.compile(r"(?:aluno|nome do aluno|discente)\s*[:\-]\s*([A-ZÀ-Ý][A-ZÀ-Ý\s]{5,})", re.IGNORECASE),
]
REGISTRY_PATTERNS = [
    re.compile(r"(?:matricula|matrícula|registro|ra)\s*[:\-]?\s*([0-9.\-\/]+)", re.IGNORECASE),
]
CPF_PATTERN = re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")
LINE_COMPONENT_FALLBACK = re.compile(r"^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{3,40})\s+(\d+(?:[.,]\d+)?)(?:\s+(\d{1,2}))?$")
IGNORE_NAME_TOKENS = {
    "boletim",
    "resultado",
    "periodo",
    "período",
    "turma",
    "nota",
    "nota final",
    "faltas",
    "faltas totais",
    "escola",
    "secretaria",
    "municipio",
    "município",
    "componente",
    "curricular",
}


@dataclass
class StudentPage:
    page_number: int
    student_name: str
    student_registry: str
    student_cpf: str
    components: list[dict]
    pdf_file: str
    lines: list[str]


def normalize_text(value: str) -> str:
    if not value:
        return ""
    replacements = str.maketrans(
        {
            "á": "a",
            "à": "a",
            "â": "a",
            "ã": "a",
            "ä": "a",
            "é": "e",
            "ê": "e",
            "ë": "e",
            "í": "i",
            "ï": "i",
            "ó": "o",
            "ô": "o",
            "õ": "o",
            "ö": "o",
            "ú": "u",
            "ü": "u",
            "ç": "c",
            "Á": "a",
            "À": "a",
            "Â": "a",
            "Ã": "a",
            "Ä": "a",
            "É": "e",
            "Ê": "e",
            "Ë": "e",
            "Í": "i",
            "Ï": "i",
            "Ó": "o",
            "Ô": "o",
            "Õ": "o",
            "Ö": "o",
            "Ú": "u",
            "Ü": "u",
            "Ç": "c",
        }
    )
    return value.translate(replacements).lower().strip()


def sanitize_filename(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", value.strip())
    cleaned = re.sub(r"_+", "_", cleaned).strip("._")
    return cleaned or "arquivo"


def title_case(value: str) -> str:
    return " ".join(part.capitalize() for part in normalize_whitespace(value).lower().split())


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_number(raw: str | None) -> float | None:
    if raw is None:
      return None
    cleaned = re.sub(r"[^\d,.-]", "", raw).replace(",", ".")
    if not cleaned or cleaned in {"-", "."}:
        return None
    try:
        value = float(cleaned)
    except ValueError:
        return None
    if value < 0 or value > 100:
        return None
    return value


def detect_student_name(lines: Iterable[str], full_text: str) -> str:
    text = normalize_whitespace(full_text)
    for pattern in STUDENT_NAME_PATTERNS:
        match = pattern.search(text)
        if match:
            return title_case(match.group(1))

    for line in list(lines)[:12]:
        raw_line = normalize_whitespace(line)
        if len(raw_line.split()) < 3:
            continue
        if any(token in normalize_text(raw_line) for token in IGNORE_NAME_TOKENS):
            continue
        if re.search(r"\d", raw_line):
            continue
        letters = [char for char in raw_line if char.isalpha()]
        if not letters:
            continue
        uppercase_ratio = sum(1 for char in letters if char.isupper()) / len(letters)
        if uppercase_ratio >= 0.7:
            return title_case(raw_line)

    return ""


def detect_registry(text: str) -> str:
    clean_text = normalize_whitespace(text)
    for pattern in REGISTRY_PATTERNS:
        match = pattern.search(clean_text)
        if match:
            return match.group(1)
    return ""


def detect_cpf(text: str) -> str:
    match = CPF_PATTERN.search(text or "")
    return match.group(0) if match else ""


def detect_component(line: str) -> str:
    normalized_line = normalize_text(normalize_whitespace(line))
    for component, aliases in COMPONENT_ALIASES.items():
        normalized_aliases = [normalize_text(alias) for alias in aliases]
        if any(alias and alias in normalized_line for alias in normalized_aliases):
            return component
    return ""


def extract_components(lines: list[str], full_text: str) -> list[dict]:
    found: dict[str, dict] = {}

    for index, line in enumerate(lines, start=1):
        cleaned = normalize_whitespace(line)
        if not cleaned:
            continue
        component = detect_component(cleaned)
        if not component:
            continue

        number_tokens = re.findall(r"\d+(?:[.,]\d+)?", cleaned)
        numbers = [parse_number(token) for token in number_tokens]
        numbers = [value for value in numbers if value is not None]
        if not numbers:
            continue

        faltas_match = re.search(r"faltas?\s*[:\-]?\s*(\d{1,2})", normalize_text(cleaned))
        faltas = int(faltas_match.group(1)) if faltas_match else 0
        confidence = 0.96 if faltas_match else 0.88 if len(numbers) > 1 else 0.8

        candidate = {
            "componente": component,
            "nota": numbers[0],
            "faltas_componente": faltas,
            "confidence": confidence,
            "raw_line": cleaned,
            "line_index": index,
        }
        current = found.get(component)
        if not current or (candidate["nota"] is not None and candidate["confidence"] >= current["confidence"]):
            found[component] = candidate

    if found:
        return list(found.values())

    fallback = []
    for index, line in enumerate(lines, start=1):
        cleaned = normalize_whitespace(line)
        match = LINE_COMPONENT_FALLBACK.match(cleaned)
        if not match:
            continue
        fallback.append(
            {
                "componente": title_case(match.group(1)),
                "nota": parse_number(match.group(2)),
                "faltas_componente": int(match.group(3) or "0"),
                "confidence": 0.6,
                "raw_line": cleaned,
                "line_index": index,
            }
        )

    return [item for item in fallback if item["nota"] is not None]


def split_pdf_page(reader: PdfReader, page_index: int, output_path: Path) -> None:
    writer = PdfWriter()
    writer.add_page(reader.pages[page_index])
    with output_path.open("wb") as file_handle:
        writer.write(file_handle)


def process_pdf(pdf_path: Path, output_dir: Path, turma: str, ano: int, periodo: str) -> dict:
    pdf_output_dir = output_dir / sanitize_filename(pdf_path.stem)
    pages_output_dir = pdf_output_dir / "paginas"
    pages_output_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    students: list[StudentPage] = []

    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_index, page in enumerate(pdf.pages):
            extracted_text = page.extract_text(layout=True) or page.extract_text() or ""
            lines = [normalize_whitespace(line) for line in extracted_text.splitlines() if normalize_whitespace(line)]
            name = detect_student_name(lines, extracted_text)
            registry = detect_registry(extracted_text)
            cpf = detect_cpf(extracted_text)
            components = extract_components(lines, extracted_text)

            page_label = sanitize_filename(name or registry or f"pagina_{page_index + 1:03d}")
            page_file = pages_output_dir / f"{page_index + 1:03d}_{page_label}.pdf"
            split_pdf_page(reader, page_index, page_file)

            students.append(
                StudentPage(
                    page_number=page_index + 1,
                    student_name=name,
                    student_registry=registry,
                    student_cpf=cpf,
                    components=components,
                    pdf_file=str(page_file.relative_to(pdf_output_dir)).replace("\\", "/"),
                    lines=lines[:30],
                )
            )

    payload = {
        "format": "rvs-boletim-package",
        "version": 1,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": {
            "file_name": pdf_path.name,
            "pages": len(reader.pages),
            "turma_hint": turma,
            "ano_hint": ano,
            "periodo_hint": periodo,
        },
        "students": [
            {
                "page_number": student.page_number,
                "student_name": student.student_name,
                "student_registry": student.student_registry,
                "student_cpf": student.student_cpf,
                "components": student.components,
                "pdf_file": student.pdf_file,
                "sample_lines": student.lines,
            }
            for student in students
        ],
        "summary": {
            "students_detected": len(students),
            "students_with_name": sum(1 for student in students if student.student_name),
            "students_with_components": sum(1 for student in students if student.components),
            "components_detected": sum(len(student.components) for student in students),
        },
    }

    package_path = pdf_output_dir / "pacote_boletim.json"
    package_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        "source_pdf": pdf_path.name,
        "package_file": str(package_path.relative_to(output_dir)).replace("\\", "/"),
        "students_detected": payload["summary"]["students_detected"],
        "students_with_components": payload["summary"]["students_with_components"],
        "components_detected": payload["summary"]["components_detected"],
    }


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Compila boletins em lote: separa páginas por aluno e gera um pacote JSON para importação no sistema."
    )
    parser.add_argument("--input-dir", default=str(script_dir / "entrada"), help="Pasta com os PDFs a processar.")
    parser.add_argument("--output-dir", default=str(script_dir / "saida"), help="Pasta de saída dos pacotes gerados.")
    parser.add_argument("--turma", default="", help="Turma de referência para registrar no pacote.")
    parser.add_argument("--ano", type=int, default=datetime.now().year, help="Ano letivo sugerido.")
    parser.add_argument("--periodo", default="", help="Período/bimestre sugerido.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf_files = sorted(input_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"Nenhum PDF encontrado em: {input_dir}")
        print("Coloque os boletins nessa pasta e execute novamente.")
        return 0

    results = []
    for pdf_file in pdf_files:
        try:
            result = process_pdf(pdf_file, output_dir, args.turma, args.ano, args.periodo)
            results.append(result)
            print(f"[OK] {pdf_file.name} -> {result['package_file']}")
        except Exception as exc:  # pragma: no cover - fallback operacional
            print(f"[ERRO] {pdf_file.name}: {exc}")

    index_payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "files_processed": len(results),
        "results": results,
    }
    (output_dir / "index_compilacao.json").write_text(
        json.dumps(index_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("")
    print("Compilação concluída.")
    print(f"Pacotes gerados em: {output_dir}")
    print("Importe o arquivo 'pacote_boletim.json' desejado na aba 'Importar Pacote Processado' do sistema.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
