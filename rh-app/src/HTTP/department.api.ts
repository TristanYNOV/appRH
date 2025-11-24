import type {Department} from "../interfaces/department.interface.ts";
import apiClient from "./httpClient.ts";

export const baseURLDepartment = "departments";

export const DepartmentAPI = {
    async getAll(): Promise<Department[]> {
        return apiClient.get<Department[]>(`/${baseURLDepartment}`);
    },

    async getById(id: number): Promise<Department> {
        return apiClient.get<Department>(`/${baseURLDepartment}/${id}`);
    },

    async create(department: Partial<Department>): Promise<Department> {
        return apiClient.post<Department>(`/${baseURLDepartment}`, department);
    },

    async update(department: Partial<Department>): Promise<Department> {
        return apiClient.put(`/${baseURLDepartment}/${department.id}`, department);
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLDepartment}/${id}`);
    },
};
