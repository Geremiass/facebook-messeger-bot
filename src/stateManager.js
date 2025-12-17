// Armazenar estados dos usuários em memória
const userStates = new Map();

// Estados possíveis do workflow
const STATES = {
  INITIAL: 'INITIAL',
  AWAITING_NAME: 'AWAITING_NAME',
  AWAITING_PHONE: 'AWAITING_PHONE',
  AWAITING_SPECIALTY: 'AWAITING_SPECIALTY',
  AWAITING_DATE: 'AWAITING_DATE',
  AWAITING_TIME: 'AWAITING_TIME',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  COMPLETED: 'COMPLETED'
};

// Obter estado do usuário
function getUserState(userId) {
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      state: STATES.INITIAL,
      data: {}
    });
  }
  return userStates.get(userId);
}

// Atualizar estado do usuário
function updateUserState(userId, newState, data = {}) {
  const currentState = getUserState(userId);
  userStates.set(userId, {
    state: newState,
    data: { ...currentState.data, ...data }
  });
}

// Atualizar apenas os dados sem mudar o estado
function updateUserData(userId, data) {
  const currentState = getUserState(userId);
  userStates.set(userId, {
    state: currentState.state,
    data: { ...currentState.data, ...data }
  });
}

// Resetar estado do usuário
function resetUserState(userId) {
  userStates.set(userId, {
    state: STATES.INITIAL,
    data: {}
  });
}

// Limpar estado do usuário
function clearUserState(userId) {
  userStates.delete(userId);
}

module.exports = {
  STATES,
  getUserState,
  updateUserState,
  updateUserData,
  resetUserState,
  clearUserState
};
