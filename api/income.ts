import { api } from "./client";

export type AllocationStatus = "pending" | "completed" | "at_risk";
export type TargetType = "expense" | "savings_goal";

export type Allocation = {
  id: number;
  target_type: TargetType;
  expense_id: number | null;
  savings_goal_id: number | null;
  planned_amount: number;
  status: AllocationStatus;
};

export type BudgetPeriod = {
  id: number;
  period_start: string;
  period_end: string;
  total_income: number;
  allocations: Allocation[];
};

export type IncomeInput = {
  amount: number;
  frequency: "quincenal" | "mensual";
  received_date: string;
  payment_method_id?: number | null;
};

export const createIncome = (data: IncomeInput) =>
  api.post<BudgetPeriod>("/incomes/", data).then((r) => r.data);

export const listBudgetPeriods = () =>
  api.get<BudgetPeriod[]>("/incomes/budget-periods").then((r) => r.data);

export const completeAllocation = (id: number) =>
  api.patch<Allocation>(`/incomes/allocations/${id}/complete`).then((r) => r.data);
