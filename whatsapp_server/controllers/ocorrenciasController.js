/**
 * ============================================================================
 * OCCURRENCES CONTROLLER & TRIGGER LOGIC
 * ============================================================================
 * Handles pedagogical/behavioral occurrence registration and triggers
 * automated, role-aware alerts to the respective student's responsibles.
 * ============================================================================
 */

import { WhatsAppService } from '../WhatsAppService.js';
import { pool as db } from '../config.js';

/**
 * Registers/notifies a new occurrence, maps all involved students, and triggers WhatsApp alerts.
 * @param {object} req - HTTP request object. Expected body format:
 *   {
 *     ocorrenciaId: "uuid-opcional", // Se já criada pelo frontend
 *     tipo: "evasao" | "indisciplina" | "bullying" | "agressao",
 *     parecer: "Descrição detalhada do parecer pedagógico...",
 *     envolvidos: [
 *       { alunoId: "uuid-1", papel: "AGRESSOR" }
 *     ]
 *   }
 * @param {object} res - HTTP response object.
 */
export async function registrarOcorrenciaSistemica(req, res) {
  const { ocorrenciaId, tipo, parecer, envolvidos } = req.body;

  if (!tipo || !parecer || !envolvidos || !Array.isArray(envolvidos) || envolvidos.length === 0) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios ausentes: tipo, parecer ou envolvidos.' });
  }

  try {
    let finalOcorrenciaId = ocorrenciaId;

    // 1. Se não foi fornecido um id de ocorrência preexistente, insere de forma compatível
    if (!finalOcorrenciaId) {
      // Mapeamento do tipo da ocorrência para os valores aceitos pela constraint do banco
      let tipoDb = tipo;
      if (tipo === 'atraso' || tipo === 'liberado_coord' || tipo === 'suspensao_celular') {
        tipoDb = 'indisciplina';
      }
      
      const queryOcorrencia = `
        INSERT INTO public.ocorrencias (tipo, descricao, auto_gerada) 
        VALUES ($1, $2, FALSE) 
        RETURNING id
      `;
      const resOcorrencia = await db.query(queryOcorrencia, [tipoDb, parecer]);
      finalOcorrenciaId = resOcorrencia.rows[0]?.id;
    }

    const logsRealizados = [];

    // 2. Processar cada estudante envolvido na ocorrência para notificar seus responsáveis
    for (const envolvido of envolvidos) {
      const { alunoId, papel } = envolvido; // papel = 'VITIMA' | 'AGRESSOR' | 'NEUTRO'

      // 3. Buscar os responsáveis cadastrados para este aluno
      const queryResponsaveis = `
        SELECT 
          a.nome AS aluno_nome, 
          r.id AS resp_id, 
          r.nome AS resp_nome, 
          r.whatsapp AS resp_phone
        FROM public.alunos a
        JOIN public.responsaveis r ON r.aluno_id = a.id
        WHERE a.id = $1 AND r.notificacoes_ativas = true
      `;
      const resResponsaveis = await db.query(queryResponsaveis, [alunoId]);

      if (!resResponsaveis.rows || resResponsaveis.rows.length === 0) {
        console.log(`[Ocorrência] Aluno ID ${alunoId} não possui responsáveis configurados para receber alertas.`);
        continue;
      }

      // 4. Enviar um alerta customizado para cada responsável localizado
      for (const resp of resResponsaveis.rows) {
        const { aluno_nome, resp_id, resp_nome, resp_phone } = resp;

        // Impedir envio duplicado para a mesma ocorrência + responsável
        const queryCheckDup = `
          SELECT 1 FROM public.whatsapp_envios 
          WHERE responsavel_id = $1 AND tipo_evento = 'OCORRENCIA' AND mensagem LIKE $2 AND created_at::date = CURRENT_DATE
          LIMIT 1
        `;
        const dupMatchMsg = `%Ocorrência%${tipo}%`;
        const resDup = await db.query(queryCheckDup, [resp_id, dupMatchMsg]);
        if (resDup.rows.length > 0) {
          console.log(`[Ocorrência] Alerta duplicado evitado para ${resp_nome} (Tipo: ${tipo})`);
          continue;
        }

        // Registrar log inicial do envio pendente
        const queryLog = `
          INSERT INTO public.whatsapp_envios (responsavel_id, tipo_evento, mensagem, whatsapp_destino, status)
          VALUES ($1, 'OCORRENCIA', $2, $3, 'PENDENTE')
          RETURNING id
        `;
        const logMsg = `Alerta de Ocorrência: ${tipo} (${papel || 'NEUTRO'}) - ${parecer.substring(0, 100)}`;
        const resLog = await db.query(queryLog, [resp_id, logMsg, resp_phone]);
        const logId = resLog.rows[0]?.id;

        // Chamar o serviço de WhatsApp passando os parâmetros estruturados
        const envio = await WhatsAppService.dispararAlertaEscolar(
          resp_nome,
          resp_phone,
          aluno_nome,
          'OCORRENCIA',
          {
            tipoOcorrencia: tipo,
            parecer: parecer,
            papel: papel || 'NEUTRO'
          }
        );

        // Atualizar o log final no banco de dados baseado no status da requisição
        if (envio.sucesso) {
          const querySucesso = `
            UPDATE public.whatsapp_envios 
            SET status = 'ENVIADO', mensagem_id_whatsapp = $1, updated_at = NOW() 
            WHERE id = $2
          `;
          await db.query(querySucesso, [envio.whatsapp_message_id, logId]);
          logsRealizados.push({ responsavel: resp_nome, status: 'ENVIADO' });
        } else {
          const queryFalha = `
            UPDATE public.whatsapp_envios 
            SET status = 'FALHA', erro_log = $1, updated_at = NOW() 
            WHERE id = $2
          `;
          await db.query(queryFalha, [envio.erro, logId]);
          logsRealizados.push({ responsavel: resp_nome, status: 'FALHA', erro: envio.erro });
        }
      }
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência processada e disparos de WhatsApp acionados.',
      ocorrenciaId: finalOcorrenciaId,
      envios: logsRealizados
    });

  } catch (error) {
    console.error('❌ Erro crítico ao processar ocorrência e alertar pais:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar cadastro de ocorrência.' });
  }
}
