import axios from 'axios';
import { getAuth } from 'firebase/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function requireAuth() {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error('AUTH_REQUIRED');
  return true;
}

export async function getMyCoins() {
  requireAuth();
  const { data } = await api.get('/coins/me');
  return data;
}

export async function getMyCharacter() {
  requireAuth();
  const { data } = await api.get('/characters/me');
  return data;
}

export async function purchaseCharacterItem(itemId) {
  requireAuth();
  const { data } = await api.post('/characters/purchase', { itemId });
  return data;
}

export async function createGoal(goalText, deadline) {
  requireAuth();
  const { data } = await api.post('/goals', { goalText, deadline });
  return data;
}

export async function getGoals() {
  requireAuth();
  const { data } = await api.get('/goals');
  return Array.isArray(data) ? data : data.data || [];
}

export async function deleteGoal(goalId) {
  requireAuth();
  await api.delete(`/goals/${goalId}`);
}

export async function toggleGoal(goalId) {
  requireAuth();
  const { data } = await api.patch(`/goals/${goalId}/toggle`);
  return data;
}

export async function getTodos() {
  requireAuth();
  const { data } = await api.get('/todos');
  return Array.isArray(data) ? data : data.data || [];
}

export async function createTodo(payload) {
  requireAuth();
  const { data } = await api.post('/todos', payload);
  return data;
}

export async function toggleTodo(todoId) {
  requireAuth();
  const { data } = await api.patch(`/todos/${todoId}/toggle`);
  return data;
}

export async function deleteTodo(todoId) {
  requireAuth();
  await api.delete(`/todos/${todoId}`);
}

export async function getCrews() {
  requireAuth();
  const { data } = await api.get('/crews');
  return Array.isArray(data) ? data : data.data || [];
}

export async function createCrew(payload) {
  requireAuth();
  const { data } = await api.post('/crews', payload);
  return data;
}

export async function joinCrew(crewId) {
  requireAuth();
  const { data } = await api.post(`/crews/${crewId}/join`);
  return data;
}

export async function leaveCrew(crewId) {
  requireAuth();
  const { data } = await api.post(`/crews/${crewId}/leave`);
  return data;
}

export async function getCrewTodos(crewId) {
  requireAuth();
  const { data } = await api.get(`/crews/${crewId}/todos`);
  return Array.isArray(data) ? data : data.data || [];
}

export async function getCrewMembers(crewId) {
  requireAuth();
  const { data } = await api.get(`/crews/${crewId}/members`);
  return Array.isArray(data) ? data : data.data || [];
}

export async function claimMission(missionId) {
  requireAuth();
  const { data } = await api.post('/missions/claim', { missionId });
  return data;
}

export async function getMissionStatus() {
  requireAuth();
  const { data } = await api.get('/missions/status');
  return data;
}

export default api;
