# Compilador de Boletins

Este utilitário processa PDFs de boletins em lote para:

- separar cada página em um PDF individual;
- identificar aluno, matrícula e CPF quando possível;
- extrair disciplinas, notas e faltas;
- gerar um pacote JSON compatível com a importação do sistema.

## Estrutura

- `entrada/`: coloque aqui os PDFs brutos da turma.
- `saida/`: os pacotes e páginas separadas serão criados aqui.
- `compilar_boletins.py`: script principal.
- `executar_compilador.bat`: atalho para Windows.

## Como usar

1. Coloque o PDF da turma em `entrada/`.
2. Dê duplo clique em `executar_compilador.bat`.
3. Abra `saida/` e localize a pasta do PDF processado.
4. Importe o arquivo `pacote_boletim.json` na aba `Boletins -> Importar Pacote Processado`.
5. Para publicar o PDF visível aos alunos, continue usando a aba `Boletins -> Enviar Novo Boletim`.

## Observações

- O compilador funciona melhor com PDFs que possuem texto selecionável.
- Se o boletim vier como imagem escaneada, pode ser necessário adicionar OCR em uma etapa futura.
- A extração de disciplinas usa heurísticas. Sempre vale revisar a prévia antes de importar.
