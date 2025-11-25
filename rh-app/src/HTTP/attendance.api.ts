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
import { formatDateTime } from "../utils/dateFormat.ts";

export const baseURLAttendance = "attendances";

const formatAttendanceDate = (value: string | number | Date): string => formatDateTime(value);

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

    async getByEmployeeAndDate(
        employeeId: number,
        date: string | number | Date
    ): Promise<AttendanceAPI[]> {
        const formattedDate = encodeURIComponent(formatAttendanceDate(date));
        const data = await apiClient.get<unknown>(
            `/${baseURLAttendance}/employee/${employeeId}/date/${formattedDate}`
        );
        return decode(
            attendanceAPICodec.array(),
            data,
            "AttendanceAPI.getByEmployeeAndDate"
        );
    },

    async getByDateRange(
        startDate: string | number | Date,
        endDate: string | number | Date
    ): Promise<AttendanceAPI[]> {
        const formattedStart = encodeURIComponent(formatAttendanceDate(startDate));
        const formattedEnd = encodeURIComponent(formatAttendanceDate(endDate));
        const data = await apiClient.get<unknown>(
            `/${baseURLAttendance}/date-range?startDate=${formattedStart}&endDate=${formattedEnd}`
        );
        return decode(attendanceAPICodec.array(), data, "AttendanceAPI.getByDateRange");
    },

    async create(attendance: AttendanceCreate): Promise<AttendanceAPI> {
        const payload = decode(
            attendanceCreateCodec,
            attendance,
            "AttendanceAPI.create.payload"
        );
        const formattedPayload = {
            ...payload,
            date: formatAttendanceDate(payload.date),
        };
        const created = await apiClient.post<unknown>(`/${baseURLAttendance}`, formattedPayload);
        return decode(attendanceAPICodec, created, "AttendanceAPI.create.response");
    },

    async update(id: number, attendance: AttendanceUpdate): Promise<AttendanceAPI> {
        const payload = decode(
            attendanceUpdateCodec,
            attendance,
            "AttendanceAPI.update.payload"
        );
        const formattedPayload = {
            ...payload,
            date: payload.date ? formatAttendanceDate(payload.date) : undefined,
        };
        const updated = await apiClient.put<unknown>(`/${baseURLAttendance}/${id}`, formattedPayload);

        const parsed = attendanceAPICodec.safeParse(updated);
        if (parsed.success) {
            return parsed.data;
        }

        if (typeof updated === "string" || updated == null) {
            // Some backends return a confirmation string instead of the updated object.
            // Fetch the latest value to keep the client state in sync without failing decoding.
            return this.getById(id);
        }

        console.error(`[DECODE][AttendanceAPI.update.response]`, parsed.error.format());
        throw new Error(
            "Les données reçues pour AttendanceAPI.update.response ne respectent pas le contrat attendu."
        );
    },

    async remove(id: number): Promise<void> {
        return apiClient.delete(`/${baseURLAttendance}/${id}`);
    },
};
