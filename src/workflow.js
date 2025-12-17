const messenger = require('./messenger');
const stateManager = require('./stateManager');
const storage = require('./storage');

const CLINIC_NAME = process.env.CLINIC_NAME || 'Clínica Saúde';
const SPECIALTIES = (process.env.AVAILABLE_SPECIALTIES || 'Clínico Geral,Pediatria,Cardiologia,Dermatologia').split(',');

// Processar entrada do usuário
async function processUserInput(userId, text, userState) {
  const { state, data } = userState;

  switch (state) {
    case stateManager.STATES.INITIAL:
      await handleInitialState(userId, text);
      break;

    case stateManager.STATES.AWAITING_NAME:
      await handleNameInput(userId, text);
      break;

    case stateManager.STATES.AWAITING_PHONE:
      await handlePhoneInput(userId, text);
      break;

    case stateManager.STATES.AWAITING_SPECIALTY:
      await handleSpecialtyInput(userId, text);
      break;

    case stateManager.STATES.AWAITING_DATE:
      await handleDateInput(userId, text);
      break;

    case stateManager.STATES.AWAITING_TIME:
      await handleTimeInput(userId, text);
      break;

    case stateManager.STATES.AWAITING_CONFIRMATION:
      await handleConfirmation(userId, text);
      break;

    default:
      await messenger.sendTextMessage(userId, 'Desculpe, ocorreu um erro. Digite "agendar" para começar novamente.');
      stateManager.resetUserState(userId);
  }
}

// Estado inicial - menu principal
async function handleInitialState(userId, text) {
  if (text.includes('agendar') || text.includes('consulta') || text.includes('oi') || text.includes('olá') || text.includes('menu')) {
    await messenger.sendTextMessage(userId, `Olá! Bem-vindo ao ${CLINIC_NAME}! 😊`);
    await messenger.sendTextMessage(userId, 'Vou te ajudar a agendar sua consulta.');

    const buttons = [
      {
        type: 'postback',
        title: '📅 Agendar Consulta',
        payload: 'START_BOOKING'
      },
      {
        type: 'postback',
        title: '📋 Minhas Consultas',
        payload: 'VIEW_APPOINTMENTS'
      },
      {
        type: 'postback',
        title: 'ℹ️ Informações',
        payload: 'INFO'
      }
    ];

    await messenger.sendButtonMessage(userId, 'O que você gostaria de fazer?', buttons);
  } else {
    await messenger.sendTextMessage(userId, `Olá! Bem-vindo ao ${CLINIC_NAME}! Digite "agendar" para marcar uma consulta.`);
  }
}

// Processar nome
async function handleNameInput(userId, text) {
  if (text.length < 2) {
    await messenger.sendTextMessage(userId, 'Por favor, digite seu nome completo.');
    return;
  }

  stateManager.updateUserData(userId, { name: text });
  stateManager.updateUserState(userId, stateManager.STATES.AWAITING_PHONE);

  await messenger.sendTextMessage(userId, `Obrigado, ${text}! 😊`);
  await messenger.sendTextMessage(userId, 'Agora, por favor, digite seu telefone (com DDD):');
}

// Processar telefone
async function handlePhoneInput(userId, text) {
  const phone = text.replace(/\D/g, '');

  if (phone.length < 10 || phone.length > 11) {
    await messenger.sendTextMessage(userId, 'Telefone inválido. Por favor, digite um número válido com DDD (ex: 11987654321):');
    return;
  }

  stateManager.updateUserData(userId, { phone: phone });
  stateManager.updateUserState(userId, stateManager.STATES.AWAITING_SPECIALTY);

  await messenger.sendTextMessage(userId, 'Ótimo! 📞');
  await askSpecialty(userId);
}

// Perguntar especialidade
async function askSpecialty(userId) {
  const quickReplies = SPECIALTIES.map(specialty => ({
    content_type: 'text',
    title: specialty.trim(),
    payload: `SPECIALTY_${specialty.trim().toUpperCase().replace(/\s+/g, '_')}`
  }));

  await messenger.sendQuickReplies(
    userId,
    'Qual especialidade você precisa?',
    quickReplies
  );
}

// Processar especialidade
async function handleSpecialtyInput(userId, text) {
  const specialty = SPECIALTIES.find(s => s.toLowerCase().includes(text.toLowerCase()));

  if (!specialty) {
    await messenger.sendTextMessage(userId, 'Especialidade não encontrada. Por favor, escolha uma das opções:');
    await askSpecialty(userId);
    return;
  }

  stateManager.updateUserData(userId, { specialty: specialty });
  stateManager.updateUserState(userId, stateManager.STATES.AWAITING_DATE);

  await messenger.sendTextMessage(userId, `${specialty} selecionado! 👨‍⚕️`);
  await askDate(userId);
}

// Perguntar data
async function askDate(userId) {
  const dates = getAvailableDates();
  const quickReplies = dates.map(date => ({
    content_type: 'text',
    title: date,
    payload: `DATE_${date}`
  }));

  await messenger.sendQuickReplies(
    userId,
    'Escolha uma data disponível:',
    quickReplies
  );
}

// Gerar datas disponíveis (próximos 5 dias úteis)
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  let daysAdded = 0;
  let currentDate = new Date(today);

  while (daysAdded < 5) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();

    // Pular fins de semana
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      dates.push(`${day}/${month}`);
      daysAdded++;
    }
  }

  return dates;
}

// Processar data
async function handleDateInput(userId, text) {
  // Validar formato de data
  const dateRegex = /^(\d{2})\/(\d{2})$/;
  const match = text.match(dateRegex);

  if (!match) {
    await messenger.sendTextMessage(userId, 'Data inválida. Use o formato DD/MM:');
    await askDate(userId);
    return;
  }

  stateManager.updateUserData(userId, { date: text });
  stateManager.updateUserState(userId, stateManager.STATES.AWAITING_TIME);

  await messenger.sendTextMessage(userId, `Data ${text} selecionada! 📅`);
  await askTime(userId);
}

// Perguntar horário
async function askTime(userId) {
  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const quickReplies = times.map(time => ({
    content_type: 'text',
    title: time,
    payload: `TIME_${time}`
  }));

  await messenger.sendQuickReplies(
    userId,
    'Escolha um horário disponível:',
    quickReplies
  );
}

// Processar horário
async function handleTimeInput(userId, text) {
  // Validar formato de horário
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const match = text.match(timeRegex);

  if (!match) {
    await messenger.sendTextMessage(userId, 'Horário inválido. Use o formato HH:MM:');
    await askTime(userId);
    return;
  }

  stateManager.updateUserData(userId, { time: text });
  stateManager.updateUserState(userId, stateManager.STATES.AWAITING_CONFIRMATION);

  await showAppointmentSummary(userId);
}

// Mostrar resumo e pedir confirmação
async function showAppointmentSummary(userId) {
  const userState = stateManager.getUserState(userId);
  const { name, phone, specialty, date, time } = userState.data;

  const summary = `
📋 *Resumo da Consulta*

👤 Paciente: ${name}
📞 Telefone: ${formatPhone(phone)}
🏥 Especialidade: ${specialty}
📅 Data: ${date}
🕐 Horário: ${time}

Confirmar agendamento?
  `.trim();

  const buttons = [
    {
      type: 'postback',
      title: '✅ Confirmar',
      payload: 'CONFIRM_APPOINTMENT'
    },
    {
      type: 'postback',
      title: '❌ Cancelar',
      payload: 'CANCEL_APPOINTMENT'
    }
  ];

  await messenger.sendButtonMessage(userId, summary, buttons);
}

// Processar confirmação
async function handleConfirmation(userId, text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('sim') || lowerText.includes('confirmar') || lowerText.includes('ok')) {
    await confirmAppointment(userId);
  } else if (lowerText.includes('não') || lowerText.includes('nao') || lowerText.includes('cancelar')) {
    await cancelAppointment(userId);
  } else {
    await messenger.sendTextMessage(userId, 'Por favor, responda "sim" para confirmar ou "não" para cancelar.');
  }
}

// Confirmar agendamento
async function confirmAppointment(userId) {
  const userState = stateManager.getUserState(userId);
  const appointment = {
    userId: userId,
    ...userState.data,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  // Salvar agendamento
  storage.saveAppointment(appointment);

  await messenger.sendTextMessage(userId, '✅ Consulta agendada com sucesso!');
  await messenger.sendTextMessage(userId, `Sua consulta está marcada para ${appointment.date} às ${appointment.time}.`);
  await messenger.sendTextMessage(userId, `Você receberá uma confirmação no telefone ${formatPhone(appointment.phone)}.`);
  await messenger.sendTextMessage(userId, 'Digite "menu" para voltar ao menu principal.');

  // Resetar estado
  stateManager.resetUserState(userId);
}

// Cancelar agendamento
async function cancelAppointment(userId) {
  await messenger.sendTextMessage(userId, '❌ Agendamento cancelado.');
  await messenger.sendTextMessage(userId, 'Digite "agendar" se quiser marcar uma nova consulta.');

  stateManager.resetUserState(userId);
}

// Formatar telefone
function formatPhone(phone) {
  if (phone.length === 11) {
    return `(${phone.substr(0, 2)}) ${phone.substr(2, 5)}-${phone.substr(7)}`;
  } else if (phone.length === 10) {
    return `(${phone.substr(0, 2)}) ${phone.substr(2, 4)}-${phone.substr(6)}`;
  }
  return phone;
}

// Processar quick reply
async function processQuickReply(userId, payload) {
  const userState = stateManager.getUserState(userId);

  if (payload.startsWith('SPECIALTY_')) {
    const specialty = payload.replace('SPECIALTY_', '').replace(/_/g, ' ');
    const formattedSpecialty = SPECIALTIES.find(s => s.toUpperCase().replace(/\s+/g, '_') === payload.replace('SPECIALTY_', ''));
    await handleSpecialtyInput(userId, formattedSpecialty || specialty);
  } else if (payload.startsWith('DATE_')) {
    const date = payload.replace('DATE_', '');
    await handleDateInput(userId, date);
  } else if (payload.startsWith('TIME_')) {
    const time = payload.replace('TIME_', '');
    await handleTimeInput(userId, time);
  }
}

// Processar postback
async function processPostback(userId, payload) {
  switch (payload) {
    case 'START_BOOKING':
      stateManager.updateUserState(userId, stateManager.STATES.AWAITING_NAME);
      await messenger.sendTextMessage(userId, 'Vamos começar! Para qual paciente é a consulta?');
      await messenger.sendTextMessage(userId, 'Por favor, digite o nome completo:');
      break;

    case 'VIEW_APPOINTMENTS':
      await viewUserAppointments(userId);
      break;

    case 'INFO':
      await sendInfo(userId);
      break;

    case 'CONFIRM_APPOINTMENT':
      await confirmAppointment(userId);
      break;

    case 'CANCEL_APPOINTMENT':
      await cancelAppointment(userId);
      break;

    default:
      await messenger.sendTextMessage(userId, 'Opção desconhecida. Digite "menu" para ver as opções.');
  }
}

// Ver consultas do usuário
async function viewUserAppointments(userId) {
  const appointments = storage.getUserAppointments(userId);

  if (appointments.length === 0) {
    await messenger.sendTextMessage(userId, 'Você não tem consultas agendadas.');
    await messenger.sendTextMessage(userId, 'Digite "agendar" para marcar uma consulta.');
    return;
  }

  await messenger.sendTextMessage(userId, '📋 Suas consultas agendadas:');

  for (const apt of appointments) {
    const message = `
${apt.specialty}
📅 ${apt.date} às ${apt.time}
👤 ${apt.name}
📞 ${formatPhone(apt.phone)}
Status: ${apt.status === 'confirmed' ? '✅ Confirmada' : '⏳ Pendente'}
    `.trim();

    await messenger.sendTextMessage(userId, message);
  }
}

// Enviar informações
async function sendInfo(userId) {
  const info = `
ℹ️ *Informações do ${CLINIC_NAME}*

🏥 Especialidades disponíveis:
${SPECIALTIES.map(s => `   • ${s}`).join('\n')}

⏰ Horário de atendimento:
   Segunda a Sexta: ${process.env.CLINIC_HOURS || '08:00-18:00'}

📞 Para mais informações, entre em contato com nossa recepção.

Digite "menu" para voltar ao menu principal.
  `.trim();

  await messenger.sendTextMessage(userId, info);
}

module.exports = {
  processUserInput,
  processQuickReply,
  processPostback
};
