/**
 * ============================================================================
 * RVS GESTOR WHATSAPP EXPRESS SERVER
 * ============================================================================
 * An autonomous local Node.js background microservice connecting Supabase
 * Postgres database triggers and Evolution API communications.
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool as db } from './config.js';
import { WhatsAppService } from './WhatsAppService.js';
import { registrarOcorrenciaSistemica } from './controllers/ocorrenciasController.js';
import { dispararComunicadoMassa } from './controllers/comunicadosController.js';

// Load variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (Allows frontend loaded from local system to make API requests)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

app.use(express.json());

// --- ENDPOINTS ---

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RVS WhatsApp Server is running.' });
});

/**
 * Endpoint: Register and notify occurrences
 */
app.post('/api/ocorrencias/registrar', registrarOcorrenciaSistemica);

/**
 * Endpoint: Dispatch mass communications
 */
app.post('/api/comunicados/disparar', dispararComunicadoMassa);

/**
 * Endpoint: Receives daily frequency/attendance update and triggers WhatsApp notifications
 * Body:
 * {
 *   alunoId: "uuid",
 *   tipo: "entrada" | "saida",
 *   status: "P" | "F" | "FJ",
 *   horario: "19:00"
 * }
 */
app.post('/api/frequencia/notificar', async (req, res) => {
  const { alunoId, tipo, status, horario } = req.body;

  if (!alunoId || !tipo || !status) {
    return res.status(400).json({ erro: 'Parâmetros alunoId, tipo e status são obrigatórios.' });
  }

  // Só notifica se for Falta (F) ou Evasão (Entrada P e Saída F)
  if (status !== 'F' && status !== 'EVASAO') {
    return res.status(200).json({ sucesso: true, mensagem: 'Status não requer notificação automática.' });
  }

  try {
    // 1. Buscar os detalhes do aluno
    const resAluno = await db.query('SELECT nome FROM public.alunos WHERE id = $1', [alunoId]);
    const alunoNome = resAluno.rows[0]?.nome;

    if (!alunoNome) {
      return res.status(404).json({ erro: 'Aluno não localizado.' });
    }

    // 2. Buscar responsáveis pelo aluno
    const resResponsaveis = await db.query(
      'SELECT id, nome, whatsapp FROM public.responsaveis WHERE aluno_id = $1 AND notificacoes_ativas = true',
      [alunoId]
    );

    if (resResponsaveis.rows.length === 0) {
      console.log(`[Frequência] Aluno ${alunoNome} não possui responsáveis configurados para receber notificações.`);
      return res.status(200).json({ sucesso: true, mensagem: 'Nenhum responsável com notificações ativas localizado.' });
    }

    const tipoEvento = status === 'EVASAO' ? 'EVASAO' : (tipo === 'entrada' ? 'ENTRADA' : 'SAIDA');
    const logsRealizados = [];

    // 3. Loop e disparo para cada responsável cadastrado
    for (const resp of resResponsaveis.rows) {
      const { id: respId, nome: respNome, whatsapp: respPhone } = resp;

      // Impedir envio duplicado para o mesmo aluno_id + tipo_evento no mesmo dia letivo
      const queryCheckDup = `
        SELECT 1 FROM public.whatsapp_envios 
        WHERE responsavel_id = $1 AND tipo_evento = $2 AND created_at::date = CURRENT_DATE
        LIMIT 1
      `;
      const resDup = await db.query(queryCheckDup, [respId, tipoEvento]);
      if (resDup.rows.length > 0) {
        console.log(`[Frequência] Alerta duplicado evitado para ${respNome} (Evento: ${tipoEvento})`);
        continue;
      }

      // Log inicial do envio pendente
      const queryLog = `
        INSERT INTO public.whatsapp_envios (responsavel_id, tipo_evento, mensagem, whatsapp_destino, status)
        VALUES ($1, $2, $3, $4, 'PENDENTE')
        RETURNING id
      `;
      const logMsg = `Alerta de Frequência: ${tipoEvento} (Aluno: ${alunoNome})`;
      const resLog = await db.query(queryLog, [respId, tipoEvento, logMsg, respPhone]);
      const logId = resLog.rows[0]?.id;

      // Disparar via WhatsApp
      const envio = await WhatsAppService.dispararAlertaEscolar(
        respNome,
        respPhone,
        alunoNome,
        status === 'EVASAO' ? 'EVASAO' : (tipo === 'entrada' ? 'ENTRADA' : 'SAIDA'), // map a 'F' na entrada como ENTRADA, etc.
        { horario: horario }
      );

      // Atualizar logs
      if (envio.sucesso) {
        await db.query(
          "UPDATE public.whatsapp_envios SET status = 'ENVIADO', mensagem_id_whatsapp = $1, updated_at = NOW() WHERE id = $2",
          [envio.whatsapp_message_id, logId]
        );
        logsRealizados.push({ responsavel: respNome, status: 'ENVIADO' });
      } else {
        await db.query(
          "UPDATE public.whatsapp_envios SET status = 'FALHA', erro_log = $1, updated_at = NOW() WHERE id = $2",
          [envio.erro, logId]
        );
        logsRealizados.push({ responsavel: respNome, status: 'FALHA', erro: envio.erro });
      }
    }

    return res.status(200).json({ sucesso: true, envios: logsRealizados });

  } catch (error) {
    console.error('❌ Erro crítico ao notificar falta escolar:', error);
    return res.status(500).json({ erro: 'Erro interno ao disparar alertas de frequência.' });
  }
});

/**
 * Endpoint: Returns general statistics of notifications
 */
app.get('/api/whatsapp/stats', async (req, res) => {
  try {
    const qStats = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'ENVIADO') AS enviados,
        COUNT(*) FILTER (WHERE status = 'FALHA') AS falhas,
        COUNT(*) FILTER (WHERE status = 'PENDENTE') AS pendentes,
        COUNT(*) AS total
      FROM public.whatsapp_envios
    `;
    const resStats = await db.query(qStats);
    const { enviados, falhas, pendentes, total } = resStats.rows[0];
    
    // Sucesso (%)
    const totalDisparos = Number(enviados) + Number(falhas);
    const sucessoPercent = totalDisparos > 0 ? Math.round((Number(enviados) / totalDisparos) * 100) : 100;

    res.status(200).json({
      enviados: Number(enviados),
      falhas: Number(falhas),
      pendentes: Number(pendentes),
      total: Number(total),
      sucesso_percent: sucessoPercent
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de WhatsApp:', error);
    res.status(500).json({ erro: 'Erro interno ao carregar estatísticas.' });
  }
});

/**
 * Endpoint: Retries failed notifications (max 3 times)
 */
app.post('/api/whatsapp/reenviar', async (req, res) => {
  try {
    // Buscar envios em falha com menos de 3 tentativas
    const qFailed = `
      SELECT 
        we.id AS log_id,
        we.whatsapp_destino AS phone,
        we.mensagem AS text,
        we.tentativas,
        r.nome AS resp_nome
      FROM public.whatsapp_envios we
      LEFT JOIN public.responsaveis r ON we.responsavel_id = r.id
      WHERE we.status = 'FALHA' AND we.tentativas < 3
      LIMIT 10
    `;
    const resFailed = await db.query(qFailed);

    if (resFailed.rows.length === 0) {
      return res.status(200).json({ sucesso: true, mensagem: 'Nenhum envio falhado qualificado para reenvio localizado.' });
    }

    const resultados = [];
    for (const log of resFailed.rows) {
      const { log_id, phone, text, tentativas, resp_nome } = log;
      const novasTentativas = tentativas + 1;

      // Executa o reenvio de texto
      const reenvio = await WhatsAppService.sendTextMessage(phone, text);

      if (reenvio.sucesso) {
        await db.query(
          "UPDATE public.whatsapp_envios SET status = 'ENVIADO', mensagem_id_whatsapp = $1, tentativas = $2, erro_log = NULL, updated_at = NOW() WHERE id = $3",
          [reenvio.whatsapp_message_id, novasTentativas, log_id]
        );
        resultados.push({ id: log_id, status: 'REENVIADO' });
      } else {
        await db.query(
          "UPDATE public.whatsapp_envios SET tentativas = $1, erro_log = $2, updated_at = NOW() WHERE id = $3",
          [novasTentativas, reenvio.erro, log_id]
        );
        resultados.push({ id: log_id, status: 'FALHOU_NOVAMENTE', erro: reenvio.erro });
      }
    }

    res.status(200).json({ sucesso: true, processados: resultados });
  } catch (error) {
    console.error('❌ Erro no job de reenvio de WhatsApp:', error);
    res.status(500).json({ erro: 'Erro interno ao processar reenvios.' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 [WhatsApp Server] Background messaging service running on port ${PORT}`);
});
