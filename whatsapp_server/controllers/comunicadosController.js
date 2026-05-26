/**
 * ============================================================================
 * MASS BROADCAST CONTROLLER (CAMPANHAS / AVISOS EM MASSA)
 * ============================================================================
 * Handles bulk messaging for general school announcements with custom
 * anti-ban safety throttling (random delay sleep/jitter).
 * ============================================================================
 */

import { WhatsAppService } from '../WhatsAppService.js';
import { pool as db } from '../config.js';

// Helper utility for async timeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Initializes a mass campaign, registers recipients, and starts the background dispatch loop.
 * @param {object} req - HTTP request. Expected body format:
 *   {
 *     titulo: "Reunião de Pais - 2º Bimestre",
 *     mensagem: "Prezados pais, convidamos para a reunião no dia 15/06 às 19h.",
 *     destinatariosTurmas: "TODOS" | ["Turma 101", "Turma 201"]
 *   }
 * @param {object} res - HTTP response.
 */
export async function dispararComunicadoMassa(req, res) {
  const { titulo, mensagem, destinatariosTurmas } = req.body;

  if (!titulo || !mensagem || !destinatariosTurmas) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios ausentes: titulo, mensagem ou destinatariosTurmas.' });
  }

  try {
    // 1. Criar registro da campanha/comunicado no banco
    const queryCampanha = `
      INSERT INTO public.comunicados (titulo, mensagem, status) 
      VALUES ($1, $2, 'AGENDADO') 
      RETURNING id
    `;
    const resCampanha = await db.query(queryCampanha, [titulo, mensagem]);
    const campanhaId = resCampanha.rows[0]?.id;

    // 2. Buscar responsáveis qualificados no banco de dados
    let queryDestinatarios = `
      SELECT 
        r.id AS resp_id, 
        r.nome AS resp_nome, 
        r.whatsapp AS resp_phone
      FROM public.responsaveis r
      JOIN public.alunos a ON r.aluno_id = a.id
      WHERE r.notificacoes_ativas = true
    `;
    let queryParams = [];

    // Filtrar por turmas específicas caso não seja "TODOS"
    if (destinatariosTurmas !== 'TODOS') {
      queryDestinatarios += ' AND a.turma_id = ANY($1)';
      queryParams.push(Array.isArray(destinatariosTurmas) ? destinatariosTurmas : [destinatariosTurmas]);
    }

    const resDestinatarios = await db.query(queryDestinatarios, queryParams);

    if (!resDestinatarios.rows || resDestinatarios.rows.length === 0) {
      // Cancela campanha caso não encontre contatos
      await db.query("UPDATE public.comunicados SET status = 'CONCLUIDO', total_destinatarios = 0 WHERE id = $1", [campanhaId]);
      return res.status(200).json({ sucesso: false, mensagem: 'Nenhum responsável elegível encontrado para esta turma.' });
    }

    const totalDest = resDestinatarios.rows.length;

    // 3. Vincular individualmente todos os destinatários na tabela de controle de envio
    for (const dest of resDestinatarios.rows) {
      const queryDestLink = `
        INSERT INTO public.comunicado_destinatarios (comunicado_id, responsavel_id, status)
        VALUES ($1, $2, 'PENDENTE')
        ON CONFLICT DO NOTHING
      `;
      await db.query(queryDestLink, [campanhaId, dest.resp_id]);
    }

    // 4. Mudar status da campanha para ENVIANDO
    await db.query(
      "UPDATE public.comunicados SET status = 'ENVIANDO', total_destinatarios = $1 WHERE id = $2",
      [totalDest, campanhaId]
    );

    // 5. Iniciar loop de disparo em segundo plano (Execução assíncrona desacoplada)
    // Isso evita travar o tempo de resposta HTTP do servidor (timeout)
    processarFilaCampanha(campanhaId, mensagem, resDestinatarios.rows);

    return res.status(202).json({
      sucesso: true,
      mensagem: 'Campanha iniciada com sucesso. Disparos ocorrendo em segundo plano.',
      campanhaId,
      total_destinatarios: totalDest
    });

  } catch (error) {
    console.error('❌ Erro crítico ao processar disparo em massa:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar campanha de comunicados.' });
  }
}

/**
 * Assynchronously dispatches campaign messages sequentially with safety intervals.
 * @param {string} campanhaId 
 * @param {string} templateMensagem 
 * @param {Array} destinatarios 
 */
async function processarFilaCampanha(campanhaId, templateMensagem, destinatarios) {
  let sucessos = 0;
  let falhas = 0;

  console.log(`[Campanha ${campanhaId}] Iniciando processamento de ${destinatarios.length} mensagens...`);

  for (const dest of destinatarios) {
    const { resp_id, resp_nome, resp_phone } = dest;

    // ------------------------------------------------------------------------
    // REGRA CRÍTICA ANTI-BAN (EVITAR SUSPENSÃO DO NÚMERO):
    // Espera aleatória (Jitter) entre 3 e 6 segundos por envio.
    // O algoritmo de spam do WhatsApp detecta fluxos idênticos sem espaçamento.
    // ------------------------------------------------------------------------
    const delayMilissegundos = 3000 + Math.random() * 3000;
    await sleep(delayMilissegundos);

    // Personalizar a mensagem mesclando variáveis cadastrais
    const mensagemPersonalizada = `📢 *COMUNICADO ESCOLAR*\n\nOlá, Sr(a). *${resp_nome}*,\n\n${templateMensagem}`;

    // Executar chamada de envio de texto
    const envio = await WhatsAppService.sendTextMessage(resp_phone, mensagemPersonalizada);

    if (envio.sucesso) {
      sucessos++;
      
      // Atualiza tabela de controle individual
      const querySucessoCD = `
        UPDATE public.comunicado_destinatarios 
        SET status = 'ENVIADO', enviado_em = NOW() 
        WHERE comunicado_id = $1 AND responsavel_id = $2
      `;
      await db.query(querySucessoCD, [campanhaId, resp_id]);

      // Cria registro na tabela geral de auditoria de envios
      const queryAuditoria = `
        INSERT INTO public.whatsapp_envios (responsavel_id, tipo_evento, mensagem, whatsapp_destino, status, mensagem_id_whatsapp)
        VALUES ($1, 'MASSA', $2, $3, 'ENVIADO', $4)
      `;
      await db.query(queryAuditoria, [resp_id, mensagemPersonalizada, resp_phone, envio.whatsapp_message_id]);

    } else {
      falhas++;

      // Atualiza tabela de controle individual em falha
      const queryFalhaCD = `
        UPDATE public.comunicado_destinatarios 
        SET status = 'FALHA', erro_log = $1 
        WHERE comunicado_id = $2 AND responsavel_id = $3
      `;
      await db.query(queryFalhaCD, [envio.erro, campanhaId, resp_id]);

      // Cria registro na tabela geral de auditoria em falha
      const queryAuditoriaFalha = `
        INSERT INTO public.whatsapp_envios (responsavel_id, tipo_evento, mensagem, whatsapp_destino, status, erro_log)
        VALUES ($1, 'MASSA', $2, $3, 'FALHA', $4)
      `;
      await db.query(queryAuditoriaFalha, [resp_id, mensagemPersonalizada, resp_phone, envio.erro]);
    }

    // Atualizar números consolidados da campanha na base
    const queryProgresso = `
      UPDATE public.comunicados 
      SET enviados_sucesso = $1, falhas = $2 
      WHERE id = $3
    `;
    await db.query(queryProgresso, [sucessos, falhas, campanhaId]);
  }

  // Concluir campanha alterando status geral
  const queryConclusao = `
    UPDATE public.comunicados 
    SET status = 'CONCLUIDO' 
    WHERE id = $1
  `;
  await db.query(queryConclusao, [campanhaId]);
  
  console.log(`[Campanha ${campanhaId}] Processamento concluído. Sucesso: ${sucessos}, Falha: ${falhas}.`);
}
