import apiClient from "./httpClient.ts";
import {
    createDepartmentCodec,
    DepartmentAPICodec,
    type CreateDepartmentPayload,
    type Department,
    type UpdateDepartmentPayload,
    updateDepartmentCodec,
} from "../interfaces/department.codec.ts";
import { decode } from "../utils/decode.ts";

export const baseURLDepartment = "departments";

export const DepartmentAPI = {
    async getAll(): Promise<Department[]> {
        const data = await apiClient.get<unknown>(`/${baseURLDepartment}`);
        return decode(DepartmentAPICodec.array(), data, "DepartmentAPI.getAll");
    },

    async getById(id: number): Promise<Department> {
        const data = await apiClient.get<unknown>(`/${baseURLDepartment}/${id}`);
        return decode(DepartmentAPICodec, data, "DepartmentAPI.getById");
    },

    async create(department: CreateDepartmentPayload): Promise<Department> {
        const payload = decode(createDepartmentCodec, department, "DepartmentAPI.create.payload");
        const created = await apiClient.post<unknown>(`/${baseURLDepartment}`, payload);
        return decode(DepartmentAPICodec, created, "DepartmentAPI.create.response");
    },

    async update(id: number, department: UpdateDepartmentPayload): Promise<Department> {
        const payload = decode(updateDepartmentCodec, department, "DepartmentAPI.update.payload");
        const updated = await apiClient.put<unknown>(`/${baseURLDepartment}/${id}`, payload);
        return decode(DepartmentAPICodec, updated, "DepartmentAPI.update.response");
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLDepartment}/${id}`);
    },
};
