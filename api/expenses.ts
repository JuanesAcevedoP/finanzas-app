import { api } from "./client";

export type Priority = "essential" | "important" | "optional";
export type Frequency = "quincenal" | "mensual" | "anual" | "unico";

export type Expense = {
  id: number;
  name: string;
  amount_cop: number;
  original_amount: number | null;
  original_currency: string | null;
  is_subscription: boolean;
  frequency: Frequency;
  due_day: number | null;
  priority: Priority;
  category_id: number | null;
  payment_method_id: number | null;
};

export type ExpenseInput = Omit<Expense, "id">;

export const listExpenses = () => api.get<Expense[]>("/expenses/").then((r) => r.data);

export const createExpense = (data: ExpenseInput) =>
  api.post<Expense>("/expenses/", data).then((r) => r.data);

export const deleteExpense = (id: number) => api.delete(`/expenses/${id}`);
