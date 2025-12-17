const axios = require('axios');
const workflow = require('./workflow');
const stateManager = require('./stateManager');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

// Enviar mensagem de texto
async function sendTextMessage(recipientId, text) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: text }
  };

  return await callSendAPI(messageData);
}

// Enviar mensagem com botões
async function sendButtonMessage(recipientId, text, buttons) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: text,
          buttons: buttons
        }
      }
    }
  };

  return await callSendAPI(messageData);
}

// Enviar quick replies
async function sendQuickReplies(recipientId, text, quickReplies) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      text: text,
      quick_replies: quickReplies
    }
  };

  return await callSendAPI(messageData);
}

// Enviar mensagem genérica (cards)
async function sendGenericMessage(recipientId, elements) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }
    }
  };

  return await callSendAPI(messageData);
}

// Chamar API do Messenger
async function callSendAPI(messageData) {
  try {
    const response = await axios.post(GRAPH_API_URL, messageData, {
      params: { access_token: PAGE_ACCESS_TOKEN },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    throw error;
  }
}

// Processar mensagem recebida
async function handleMessage(senderId, message) {
  if (message.text) {
    const text = message.text.toLowerCase().trim();

    // Obter estado atual do usuário
    const userState = stateManager.getUserState(senderId);

    // Processar no workflow
    await workflow.processUserInput(senderId, text, userState);
  } else if (message.quick_reply) {
    const payload = message.quick_reply.payload;
    await workflow.processQuickReply(senderId, payload);
  }
}

// Processar postback (botões clicados)
async function handlePostback(senderId, postback) {
  const payload = postback.payload;
  await workflow.processPostback(senderId, payload);
}

module.exports = {
  sendTextMessage,
  sendButtonMessage,
  sendQuickReplies,
  sendGenericMessage,
  handleMessage,
  handlePostback
};
