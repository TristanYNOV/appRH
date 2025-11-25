import apiClient from "./httpClient.ts";
import {
    attendanceAPICodec,
    attendanceCreateCodec,
    attendanceUpdateCodec,
    type AttendanceAPI,
    type AttendanceCreate,
    type AttendanceUpdate,
} from "../interfaces/attendance.codec.ts";
import { decode } from "../utils/decode.ts";

export const baseURLAttendance = "attendances";

export const AttendanceAPI = {
    async getAll(): Promise<AttendanceAPI[]> {
        const data = await apiClient.get<unknown>(`/${baseURLAttendance}`);
        return decode(attendanceAPICodec.array(), data, "AttendanceAPI.getAll");
    },

    async getById(id: number): Promise<AttendanceAPI> {
        const data = await apiClient.get<unknown>(`/${baseURLAttendance}/${id}`);
        return decode(attendanceAPICodec, data, "AttendanceAPI.getById");
    },

    async getByEmployee(employeeId: number): Promise<AttendanceAPI[]> {
        const data = await apiClient.get<unknown>(`/${baseURLAttendance}/employee/${employeeId}`);
        return decode(attendanceAPICodec.array(), data, "AttendanceAPI.getByEmployee");
    },

    async getByEmployeeAndDate(employeeId: number, date: string): Promise<AttendanceAPI[]> {
        const data = await apiClient.get<unknown>(
            `/${baseURLAttendance}/employee/${employeeId}/date/${date}`
        );
        return decode(
            attendanceAPICodec.array(),
            data,
            "AttendanceAPI.getByEmployeeAndDate"
        );
    },

    async getByDateRange(startDate: string, endDate: string): Promise<AttendanceAPI[]> {
        const data = await apiClient.get<unknown>(
            `/${baseURLAttendance}/date-range?startDate=${startDate}&endDate=${endDate}`
        );
        return decode(attendanceAPICodec.array(), data, "AttendanceAPI.getByDateRange");
    },

    async create(attendance: AttendanceCreate): Promise<AttendanceAPI> {
        const payload = decode(
            attendanceCreateCodec,
            attendance,
            "AttendanceAPI.create.payload"
        );
        const created = await apiClient.post<unknown>(`/${baseURLAttendance}`, payload);
        return decode(attendanceAPICodec, created, "AttendanceAPI.create.response");
    },

    async update(id: number, attendance: AttendanceUpdate): Promise<AttendanceAPI> {
        const payload = decode(
            attendanceUpdateCodec,
            attendance,
            "AttendanceAPI.update.payload"
        );
        const updated = await apiClient.put<unknown>(`/${baseURLAttendance}/${id}`, payload);
        return decode(attendanceAPICodec, updated, "AttendanceAPI.update.response");
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLAttendance}/${id}`);
    },
};
