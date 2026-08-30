const API_BASE_URL = "https://greensboro-slots-showing-mill.trycloudflare.com/api";

export const fetchTrains = async () => {
  const response = await fetch(`${API_BASE_URL}/trains/`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const fetchTrainDetails = async (trainId) => {
  const response = await fetch(`${API_BASE_URL}/trains/${trainId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const fetchStations = async () => {
  const response = await fetch(`${API_BASE_URL}/stations/`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const fetchTrainETA = async (trainId, delay = 0) => {
  const response = await fetch(`${API_BASE_URL}/trains/${trainId}/eta?delay=${delay}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const fetchTrainMLETA = async (trainId, delay = 0, weather = 0, congestion = 0) => {
  const response = await fetch(`${API_BASE_URL}/trains/${trainId}/eta/ml?delay=${delay}&weather=${weather}&congestion=${congestion}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const startSimulation = async () => {
  await fetch(`${API_BASE_URL}/simulation/start`, { method: 'POST' });
};

export const pauseSimulation = async () => {
  await fetch(`${API_BASE_URL}/simulation/pause`, { method: 'POST' });
};

export const resetSimulation = async () => {
  await fetch(`${API_BASE_URL}/simulation/reset`, { method: 'POST' });
};

export const getSimulationState = async () => {
  const response = await fetch(`${API_BASE_URL}/simulation/state`);
  return response.json();
};

export const triggerSimulationEvent = async (trainId, eventType) => {
  const response = await fetch(`${API_BASE_URL}/simulation/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ train_id: trainId, event_type: eventType })
  });
  return response.json();
};
