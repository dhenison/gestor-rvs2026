/**
 * ============================================================================
 * WHATSAPP CORE SERVICE (EVOLUTION API WRAPPER)
 * ============================================================================
 * Reusable ES Module class that encapsulates communications with the Evolution API.
 * Designed to be read and imported seamlessly in other Node.js backends.
 * 
 * Required Environment Variables:
 * - EVOLUTION_API_URL (e.g. 'https://vps-server.com')
 * - EVOLUTION_API_KEY (Global authorization key)
 * - EVOLUTION_INSTANCE_NAME (e.g. 'escola_rvs3')
 * ============================================================================
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Ensure env variables are loaded
dotenv.config();

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'escola_rvs3';

export class WhatsAppService {
  
  /**
   * Helper function to sanitize phone numbers into the exact E.164 WhatsApp format.
   * Removes all non-digit characters and ensures country code.
   * @param {string} phone - E.g. "+55 (94) 98765-4321"
   * @returns {string} - Cleaned digits only: "5594987654321"
   */
  static sanitizeNumber(phone) {
    if (!phone) return '';
    // Retorna apenas dígitos numéricos
    let digits = phone.replace(/\D/g, '');
    
    // Se o número brasileiro não tiver DDI (55), adiciona automaticamente
    if (digits.length === 11 && !digits.startsWith('55')) {
      digits = '55' + digits;
    }
    return digits;
  }

  /**
   * Directly sends a text message to a specific contact.
   * @param {string} to - Raw or sanitized phone number.
   * @param {string} text - Text message to send. Supports Markdown (*bold*, _italic_).
   * @returns {Promise<{sucesso: boolean, whatsapp_message_id?: string, erro?: string}>}
   */
  static async sendTextMessage(to, text) {
    const cleanNumber = this.sanitizeNumber(to);
    if (!cleanNumber) {
      return { sucesso: false, erro: 'Número de telefone inválido ou vazio.' };
    }

    if (!EVOLUTION_URL || !EVOLUTION_KEY) {
      return { sucesso: false, erro: 'Variáveis de ambiente EVOLUTION_API_URL ou EVOLUTION_API_KEY não configuradas.' };
    }

    const url = `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`;
    
    const payload = {
      number: cleanNumber,
      options: {
        delay: 1200,             // Simulation delay (antiban)
        presence: "composing"    // Visual feedback "typing..."
      },
      textMessage: {
        text: text
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API retornou status HTTP ${response.status}`);
      }

      return {
        sucesso: true,
        whatsapp_message_id: data.key?.id || data.messageId
      };
    } catch (error) {
      console.error('[WhatsAppService] Falha ao enviar requisição HTTP:', error.message);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }

  /**
   * Directly sends a media file/document (like a PDF report or image) to a contact.
   * @param {string} to - Phone number.
   * @param {string} fileUrl - Public HTTP URL of the file.
   * @param {string} fileName - E.g. "boletim.pdf"
   * @param {string} caption - Description accompanying the media.
   * @param {string} type - 'document' | 'image' | 'video' | 'audio'
   */
  static async sendMediaMessage(to, fileUrl, fileName, caption = '', type = 'document') {
    const cleanNumber = this.sanitizeNumber(to);
    const url = `${EVOLUTION_URL}/message/sendMedia/${INSTANCE_NAME}`;

    const payload = {
      number: cleanNumber,
      options: { delay: 1000 },
      mediaMessage: {
        mediatype: type,
        fileName: fileName,
        caption: caption,
        media: fileUrl
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha no envio de mídia.');
      return { sucesso: true, whatsapp_message_id: data.key?.id || data.messageId };
    } catch (error) {
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Evaluates school business rules and fires corresponding structured template alerts.
   * @param {string} responsavelNome 
   * @param {string} responsavelWhatsApp 
   * @param {string} alunoNome 
   * @param {string} tipoEvento - 'ENTRADA' | 'SAIDA' | 'EVASAO' | 'OCORRENCIA' | 'MASSA'
   * @param {object} dados - Custom data payload matching the trigger requirements.
   */
  static async dispararAlertaEscolar(responsavelNome, responsavelWhatsApp, alunoNome, tipoEvento, dados = {}) {
    let mensagem = '';
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    switch (tipoEvento) {
      case 'ENTRADA':
        mensagem = `🔔 *RVS GESTOR - Alerta de Presença*\n\nOlá, Sr(a). *${responsavelNome}*,\n\nInformamos que o(a) aluno(a) *${alunoNome}* registrou a *ENTRADA* na escola às *${dados.horario || hora}*.\n\n_Tenha um excelente dia!_`;
        break;

      case 'SAIDA':
        mensagem = `🔔 *RVS GESTOR - Alerta de Saída*\n\nOlá, Sr(a). *${responsavelNome}*,\n\nConfirmamos que o(a) aluno(a) *${alunoNome}* registrou a *SAÍDA* da escola às *${dados.horario || hora}* e está devidamente liberado(a).`;
        break;

      case 'EVASAO':
        mensagem = `⚠️ *ALERTA CRÍTICO - EVASÃO DETECTADA*\n\nPrezado(a) *${responsavelNome}*,\n\nIdentificamos que o(a) aluno(a) *${alunoNome}* registrou entrada na escola hoje, porém *NÃO FOI LOCALIZADO(A)* no momento da chamada de saída consolidada às *${dados.horario || hora}*.\n\n🚨 *Por favor, entre em contato imediatamente com a coordenação do colégio!*`;
        break;

      case 'OCORRENCIA':
        const { tipoOcorrencia, parecer, papel } = dados;
        let rotuloPapel = '';
        if (papel === 'VITIMA') rotuloPapel = ' (como parte afetada/vítima)';
        if (papel === 'AGRESSOR') rotuloPapel = ' (como parte envolvida/acusada)';
        
        mensagem = `📋 *RVS GESTOR - Registro de Ocorrência Escolar*\n\nPrezado(a) *${responsavelNome}*,\n\nInformamos que foi registrada uma ocorrência escolar relacionada ao(à) aluno(a) *${alunoNome}*${rotuloPapel}:\n\n📌 *Tipo de Ocorrência:* ${tipoOcorrencia}\n📌 *Parecer Pedagógico:* _"${parecer}"_\n\nPedimos que entre em contato com a coordenação pedagógica para ciência e alinhamento de condutas.`;
        break;

      case 'MASSA':
        mensagem = dados.textoComunicado;
        break;

      default:
        mensagem = `Prezado(a) *${responsavelNome}*, informativo escolar de interesse do(a) aluno(a) *${alunoNome}*.`;
    }

    return await this.sendTextMessage(responsavelWhatsApp, mensagem);
  }
}
