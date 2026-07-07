import cv2
import requests
import json
import time
import sys
import numpy as np
from io import BytesIO

# Configurações de Conexão com o Supabase
SUPABASE_URL = "https://xjtluflzpkkbckkcwagf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Cooldown para evitar múltiplos registros seguidos do mesmo aluno (60 segundos)
COOLDOWN_SECONDS = 60
ultimos_registros = {} # { aluno_id: timestamp }

# Importação dinâmica da DeepFace
try:
    from deepface import DeepFace
except ImportError:
    print("❌ Erro: Biblioteca 'deepface' não encontrada.")
    print("Execute no terminal: pip install deepface tf-keras")
    sys.exit(1)

def buscar_aluno_por_face(embedding):
    """
    Envia o vetor de 128 dimensões para a RPC do Supabase buscar o aluno correspondente.
    """
    url = f"{SUPABASE_URL}/rest/v1/rpc/buscar_aluno_por_face"
    payload = {
        "p_embedding": list(embedding),
        "p_limite_distancia": 0.40
    }
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        if response.status_code == 200:
            resultados = response.json()
            if resultados:
                return resultados[0]
        else:
            print(f"Erro na busca vetorial (RPC): {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Erro de conexão com o Supabase: {e}")
    return None

def registrar_frequencia(aluno_id, nome_aluno, tipo_acesso):
    """
    Registra a presença na tabela 'frequencia' do Supabase.
    """
    url = f"{SUPABASE_URL}/rest/v1/frequencia"
    payload = {
        "aluno_id": aluno_id,
        "data": time.strftime("%Y-%m-%d"),
        "tipo": tipo_acesso,
        "status": "P"
    }
    
    try:
        res = requests.post(url, headers={
            **HEADERS,
            "Prefer": "resolution=merge-duplicates"
        }, json=payload)
        
        if res.status_code in [200, 201]:
            print(f"✅ Frequência de {tipo_acesso.upper()} registrada para {nome_aluno}!")
            return True
        else:
            print(f"❌ Erro ao salvar frequência: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Erro ao salvar no banco: {e}")
    return False

def cadastrar_face_manual(aluno_id, embedding):
    """
    Cadastra o vetor facial de um aluno diretamente no banco de dados.
    """
    url = f"{SUPABASE_URL}/rest/v1/aluno_faces"
    payload = {
        "aluno_id": aluno_id,
        "embedding": list(embedding)
    }
    try:
        res = requests.post(url, headers={
            **HEADERS,
            "Prefer": "resolution=merge-duplicates"
        }, json=payload)
        if res.status_code in [200, 201]:
            print(f"🎉 Biometria facial cadastrada com sucesso para o aluno ID: {aluno_id}!")
            return True
        else:
            print(f"❌ Erro ao salvar vetor no banco: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Erro ao enviar vetor: {e}")
    return False

def listar_alunos_pendentes():
    url = f"{SUPABASE_URL}/rest/v1/alunos?select=id,nome,matricula&limit=20"
    try:
        res = requests.get(url, headers=HEADERS)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print(f"Erro ao listar alunos: {e}")
    return []

def sincronizar_novas_fotos():
    """
    Busca alunos que possuem foto_url no Supabase mas ainda NÃO possuem registro na tabela aluno_faces.
    Baixa a foto, gera o embedding em background e salva no banco de dados automaticamente.
    """
    print("\n🔄 [Sincronizador] Verificando se há novos alunos com foto cadastrada...")
    try:
        # 1. Pega todos os IDs de faces já cadastradas
        res_faces = requests.get(f"{SUPABASE_URL}/rest/v1/aluno_faces?select=aluno_id", headers=HEADERS)
        if res_faces.status_code != 200:
            print("❌ [Sincronizador] Erro ao buscar aluno_faces")
            return
        faces_cadastradas = {f["aluno_id"] for f in res_faces.json()}

        # 2. Pega todos os alunos ativos que possuem foto_url
        res_alunos = requests.get(f"{SUPABASE_URL}/rest/v1/alunos?select=id,nome,foto_url&foto_url=not.is.null", headers=HEADERS)
        if res_alunos.status_code != 200:
            print("❌ [Sincronizador] Erro ao buscar alunos")
            return
        
        alunos_com_foto = res_alunos.json()
        pendentes = [a for a in alunos_com_foto if a["id"] not in faces_cadastradas and a["foto_url"].strip() != ""]

        if not pendentes:
            print("✅ [Sincronizador] Nenhuma foto nova pendente de processamento facial.")
            return

        print(f"⏳ [Sincronizador] Encontrado(s) {len(pendentes)} aluno(s) pendente(s). Iniciando processamento...")

        for a in pendentes:
            aluno_id = a["id"]
            nome = a["nome"]
            foto_url = a["foto_url"]

            print(f"📷 [Sincronizador] Processando rosto de: {nome}...")
            try:
                # Baixa a imagem
                response = requests.get(foto_url, timeout=10)
                if response.status_code != 200:
                    print(f"⚠️ [Sincronizador] Falha ao baixar imagem de {nome} (HTTP {response.status_code})")
                    continue

                # Converte os bytes da imagem para formato OpenCV
                image_bytes = np.frombuffer(response.content, np.uint8)
                img = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

                if img is None or img.size == 0:
                    print(f"⚠️ [Sincronizador] Falha ao decodificar imagem de {nome}")
                    continue

                # Extrai embedding usando DeepFace
                predictions = DeepFace.represent(
                    img_path=img,
                    model_name="Facenet",
                    enforce_detection=False
                )

                if predictions:
                    embedding = predictions[0]["embedding"]
                    # Cadastra a face no banco de dados
                    sucesso = cadastrar_face_manual(aluno_id, embedding)
                    if sucesso:
                        print(f"✨ [Sincronizador] Rosto de {nome} sincronizado com sucesso!")
                else:
                    print(f"⚠️ [Sincronizador] Nenhum rosto detectado na foto de {nome}")

            except Exception as e:
                print(f"❌ [Sincronizador] Erro ao processar foto de {nome}: {e}")

    except Exception as e:
        print(f"❌ [Sincronizador] Erro geral na sincronização: {e}")
    print("----------------------------------------------------")

def main():
    print("====================================================")
    print(" RVS Escolar - Reconhecimento Facial (OpenCV Haar + DeepFace)")
    print("====================================================")
    
    # Carrega o detector de faces Haar Cascade do OpenCV (nativo e super rápido)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Mapeamento do tipo de acesso desta câmera
    TIPO_ACESSO = 'entrada' 
    
    print("⏳ Inicializando modelos de Inteligência Artificial (FaceNet)...")
    try:
        # Força o carregamento inicial do modelo
        dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
        DeepFace.represent(img_path=dummy_img, model_name="Facenet", detector_backend="opencv", enforce_detection=False)
        print("💡 Inteligência Artificial carregada com sucesso!")
    except Exception as e:
        print(f"Erro ao carregar modelos da DeepFace: {e}")

    # Sincroniza fotos recém-cadastradas no RVS Gestor
    sincronizar_novas_fotos()

    print("Iniciando câmera local...")
    video_capture = cv2.VideoCapture(0)
    
    if not video_capture.isOpened():
        print("❌ Erro: Não foi possível acessar a câmera/webcam.")
        sys.exit(1)
        
    print("🎥 Câmera conectada com sucesso!")
    print("Pressione 'c' no terminal/janela para CADASTRAR o rosto detectado a um aluno.")
    print("Pressione 's' no terminal/janela para FORÇAR sincronização de fotos do dashboard.")
    print("Pressione 'q' para SAIR.")
    print("----------------------------------------------------")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("Erro ao obter frame da câmera.")
            break

        # Converte para tons de cinza para detecção ultra-rápida (método OpenCV Cascade)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detecta rostos usando o classificador rápido do OpenCV
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(60, 60))
        
        last_embedding = None
        
        for (x, y, w, h) in faces:
            nome_display = "Desconhecido"
            cor_caixa = (0, 0, 255) # Vermelho (Desconhecido)
            
            # Recorta a região da imagem que contém o rosto
            face_crop = frame[y:y+h, x:x+w]
            
            if face_crop.size > 0:
                try:
                    # Extrai o embedding usando FaceNet apenas para o recorte da face
                    predictions = DeepFace.represent(
                        img_path=face_crop, 
                        model_name="Facenet", 
                        enforce_detection=False
                    )
                    
                    if predictions:
                        embedding = predictions[0]["embedding"]
                        last_embedding = embedding
                        
                        # 1. Tenta identificar no Supabase
                        resultado = buscar_aluno_por_face(embedding)
                        
                        if resultado:
                            aluno_id = resultado["aluno_id"]
                            nome_aluno = resultado["nome"]
                            nome_display = nome_aluno
                            cor_caixa = (0, 255, 0) # Verde (Reconhecido)
                            
                            # Controle de Cooldown
                            agora = time.time()
                            if aluno_id not in ultimos_registros or (agora - ultimos_registros[aluno_id]) > COOLDOWN_SECONDS:
                                sucesso = registrar_frequencia(aluno_id, nome_aluno, TIPO_ACESSO)
                                if sucesso:
                                    ultimos_registros[aluno_id] = agora
                except Exception as e:
                    pass

            # Desenha a caixa ao redor do rosto detectado pelo OpenCV
            cv2.rectangle(frame, (x, y), (x + w, y + h), cor_caixa, 2)
            cv2.rectangle(frame, (x, y + h), (x + w, y + h + 25), cor_caixa, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, nome_display, (x + 6, y + h + 18), font, 0.5, (255, 255, 255), 1)

        # Mostra o feed de vídeo na tela
        cv2.imshow('RVS Escolar - Reconhecimento Facial', frame)

        key = cv2.waitKey(1) & 0xFF
        
        # Pressionar 'q' para sair
        if key == ord('q'):
            break
            
        # Pressionar 's' para forçar sincronização
        elif key == ord('s'):
            sincronizar_novas_fotos()

        # Pressionar 'c' para cadastrar
        elif key == ord('c'):
            if last_embedding is None:
                print("⚠️ Nenhum rosto detectado e processado para cadastrar!")
                continue
                
            print("\n--- CADASTRO RÁPIDO DE FACE ---")
            alunos = listar_alunos_pendentes()
            if not alunos:
                print("Nenhum aluno cadastrado no sistema para vincular.")
                continue
                
            print("Selecione o aluno para vincular a esta face:")
            for idx, a in enumerate(alunos):
                print(f"[{idx}] {a['nome']} (CPF/Matrícula: {a['matricula']})")
                
            try:
                escolha = input("Digite o número do aluno correspondente (ou 'cancelar'): ")
                if escolha.lower() == 'cancelar':
                    print("Cadastro cancelado.")
                    continue
                
                idx_escolhido = int(escolha)
                if 0 <= idx_escolhido < len(alunos):
                    aluno_selecionado = alunos[idx_escolhido]
                    cadastrar_face_manual(aluno_selecionado["id"], last_embedding)
                else:
                    print("Opção inválida.")
            except Exception as e:
                print(f"Erro ao selecionar: {e}")

    # Libera recursos
    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
