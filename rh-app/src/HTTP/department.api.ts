import apiClient from "./httpClient.ts";
import { DepartmentCodec, DepartmentPayloadCodec, type Department } from "../interfaces/department.codec.ts";
import { decode } from "../utils/decode.ts";

export const baseURLDepartment = "department";

export const DepartmentAPI = {
    async getAll(): Promise<Department[]> {
        const data = await apiClient.get<unknown>(`/${baseURLDepartment}`);
        return decode(DepartmentCodec.array(), data, "DepartmentAPI.getAll");
    },

    async getById(id: number): Promise<Department> {
        const data = await apiClient.get<unknown>(`/${baseURLDepartment}/${id}`);
        return decode(DepartmentCodec, data, "DepartmentAPI.getById");
    },

    async create(department: Partial<Department>): Promise<Department> {
        const payload = decode(DepartmentPayloadCodec, department, "DepartmentAPI.create.payload");
        const created = await apiClient.post<unknown>(`/${baseURLDepartment}`, payload);
        return decode(DepartmentCodec, created, "DepartmentAPI.create.response");
    },

    async update(department: Partial<Department>): Promise<Department> {
        const payload = decode(DepartmentPayloadCodec, department, "DepartmentAPI.update.payload");
        const updated = await apiClient.put<unknown>(`/${baseURLDepartment}/${department.id}`, payload);
        return decode(DepartmentCodec, updated, "DepartmentAPI.update.response");
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLDepartment}/${id}`);
    },
};
