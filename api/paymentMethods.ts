import { api } from "./client";

export type PaymentMethod = {
  id: number;
  name: string;
  is_cash: boolean;
};

export type PaymentMethodInput = {
  name: string;
  is_cash: boolean;
};

export const listPaymentMethods = () =>
  api.get<PaymentMethod[]>("/payment-methods/").then((r) => r.data);

export const createPaymentMethod = (data: PaymentMethodInput) =>
  api.post<PaymentMethod>("/payment-methods/", data).then((r) => r.data);

export const deletePaymentMethod = (id: number) =>
  api.delete(`/payment-methods/${id}`);
