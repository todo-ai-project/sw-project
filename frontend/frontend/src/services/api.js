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
    const token = await user.getIdToken(); // 만료 임박 시 Firebase SDK가 자동 갱신
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

export async function createGoal(goalText, deadline) {
  const { data } = await api.post('/goals', { goalText, deadline });
  return data;
}

export async function getGoals() {
  const { data } = await api.get('/goals');
  return Array.isArray(data) ? data : data.data || [];
}

export async function deleteGoal(goalId) {
  await api.delete(`/goals/${goalId}`);
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

export async function getCrewTodos(crewId) {
  const { data } = await api.get(`/crews/${crewId}/todos`);
  return Array.isArray(data) ? data : data.data || [];
}

export async function getCrewMembers(crewId) {
  const { data } = await api.get(`/crews/${crewId}/members`);
  return Array.isArray(data) ? data : data.data || [];
}

export async function claimMission(missionId) {
  const { data } = await api.post('/missions/claim', { missionId });
  return data;
}

export async function getMissionStatus() {
  const token = await getAuth().currentUser.getIdToken();

  const res = await axios.get(
    'http://localhost:5001/api/missions/status',
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  );

  return res.data;
}

export default api;