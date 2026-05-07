import { api } from "./axios";
import type { ApiOk } from "../types/api";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listTasks() {
  const res = await api.get<ApiOk<{ tasks: Task[] }>>("/tasks");
  return res.data.data.tasks;
}

export async function createTask(input: { title: string; description?: string }) {
  const res = await api.post<ApiOk<{ task: Task }>>("/tasks", input);
  return res.data.data.task;
}

export async function updateTask(id: string, input: { title?: string; description?: string; completed?: boolean }) {
  const res = await api.patch<ApiOk<{ task: Task }>>(`/tasks/${id}`, input);
  return res.data.data.task;
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
}
