import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('idToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getMyCoins() {
  const { data } = await api.get('/coins/me');
  return data;
}

export async function getMyCharacter() {
  const { data } = await api.get('/characters/me');
  return data;
}

export async function purchaseCharacterItem(itemId) {
  const { data } = await api.post('/characters/purchase', { itemId });
  return data;
}

export async function createGoal(goalText) {
  const { data } = await api.post('/goals', { goalText });
  return data;
}

export async function getGoals() {
  const { data } = await api.get('/goals');
  return Array.isArray(data) ? data : data.data || [];
}

export async function toggleGoal(goalId) {
  const { data } = await api.patch(`/goals/${goalId}/toggle`);
  return data;
}

export async function getTodos() {
  const { data } = await api.get('/todos');
  return Array.isArray(data) ? data : data.data || [];
}

export async function createTodo(payload) {
  const { data } = await api.post('/todos', payload);
  return data;
}

export async function toggleTodo(todoId) {
  const { data } = await api.patch(`/todos/${todoId}/toggle`);
  return data;
}

export async function deleteTodo(todoId) {
  await api.delete(`/todos/${todoId}`);
}

export async function getCrews() {
  const { data } = await api.get('/crews');
  return Array.isArray(data) ? data : data.data || [];
}

export async function createCrew(payload) {
  const { data } = await api.post('/crews', payload);
  return data;
}

export async function joinCrew(crewId) {
  const { data } = await api.post(`/crews/${crewId}/join`);
  return data;
}

export async function leaveCrew(crewId) {
  const { data } = await api.post(`/crews/${crewId}/leave`);
  return data;
}

export async function getCrewMembers(crewId) {
  const { data } = await api.get(`/crews/${crewId}/members`);
  return Array.isArray(data) ? data : data.data || [];
}

export default api;
