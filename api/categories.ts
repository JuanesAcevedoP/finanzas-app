import { api } from "./client";

export type Category = {
  id: number;
  name: string;
};

export type CategoryInput = {
  name: string;
};

export const listCategories = () =>
  api.get<Category[]>("/categories/").then((r) => r.data);

export const createCategory = (data: CategoryInput) =>
  api.post<Category>("/categories/", data).then((r) => r.data);

export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);
