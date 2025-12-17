const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');

// Garantir que o diretório de dados existe
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Carregar agendamentos do arquivo
function loadAppointments() {
  ensureDataDir();

  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    return [];
  }
}

// Salvar agendamentos no arquivo
function saveAppointments(appointments) {
  ensureDataDir();

  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar agendamentos:', error);
  }
}

// Salvar novo agendamento
function saveAppointment(appointment) {
  const appointments = loadAppointments();

  // Gerar ID único
  appointment.id = generateId();

  appointments.push(appointment);
  saveAppointments(appointments);

  console.log('Agendamento salvo:', appointment.id);
  return appointment;
}

// Obter agendamentos de um usuário
function getUserAppointments(userId) {
  const appointments = loadAppointments();
  return appointments.filter(apt => apt.userId === userId && apt.status === 'confirmed');
}

// Obter todos os agendamentos
function getAllAppointments() {
  return loadAppointments();
}

// Obter agendamento por ID
function getAppointmentById(id) {
  const appointments = loadAppointments();
  return appointments.find(apt => apt.id === id);
}

// Atualizar agendamento
function updateAppointment(id, updates) {
  const appointments = loadAppointments();
  const index = appointments.findIndex(apt => apt.id === id);

  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
    saveAppointments(appointments);
    return appointments[index];
  }

  return null;
}

// Cancelar agendamento
function cancelAppointmentById(id) {
  return updateAppointment(id, { status: 'cancelled' });
}

// Deletar agendamento
function deleteAppointment(id) {
  const appointments = loadAppointments();
  const filtered = appointments.filter(apt => apt.id !== id);

  if (filtered.length < appointments.length) {
    saveAppointments(filtered);
    return true;
  }

  return false;
}

// Gerar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Limpar agendamentos antigos (mais de 30 dias)
function cleanOldAppointments() {
  const appointments = loadAppointments();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filtered = appointments.filter(apt => {
    const createdAt = new Date(apt.createdAt);
    return createdAt > thirtyDaysAgo || apt.status === 'confirmed';
  });

  if (filtered.length < appointments.length) {
    saveAppointments(filtered);
    console.log(`${appointments.length - filtered.length} agendamentos antigos removidos.`);
  }
}

module.exports = {
  saveAppointment,
  getUserAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointmentById,
  deleteAppointment,
  cleanOldAppointments
};
