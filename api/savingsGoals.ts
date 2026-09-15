import { api } from "./client";
import type { Priority } from "./expenses";

export type SavingsGoal = {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  is_emergency_fund: boolean;
  priority: Priority;
  payment_method_id: number | null;
};

export type SavingsGoalInput = Omit<SavingsGoal, "id">;

export const listSavingsGoals = () =>
  api.get<SavingsGoal[]>("/savings-goals/").then((r) => r.data);

export const createSavingsGoal = (data: SavingsGoalInput) =>
  api.post<SavingsGoal>("/savings-goals/", data).then((r) => r.data);

export const deleteSavingsGoal = (id: number) => api.delete(`/savings-goals/${id}`);
