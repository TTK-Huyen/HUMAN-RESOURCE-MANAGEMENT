import axios from "axios";

const notiClient = axios.create({
  baseURL: process.env.REACT_APP_NOTI_BASE_URL || "http://localhost:8085/api/v1",
  timeout: 10000,
});

export async function getNotifications(userId) {
  const res = await notiClient.get(`/users/${userId}/notifications`);
  return res.data;
}

export async function getUnreadCount(userId) {
  const res = await notiClient.get(`/users/${userId}/notifications/unread-count`);
  return res.data?.unreadCount ?? 0;
}

export async function markRead(userId, id) {
  await notiClient.patch(`/users/${userId}/notifications/${id}/read`);
}