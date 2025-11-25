import type { Attendance, AttendanceAPI } from "../interfaces/attendance.codec.ts";
import type { Department } from "../interfaces/department.codec.ts";
import type { Employee } from "../interfaces/employee.codec.ts";

const parseDate = (value: unknown): Date => {
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return new Date();
};

export const normalizeDepartment = (department: Department): Department => ({
    ...department,
    createdAt: parseDate(department.createdAt),
    updatedAt: parseDate(department.updatedAt),
});

export const normalizeEmployee = (employee: Employee): Employee => ({
    ...employee,
    hireDate: parseDate(employee.hireDate),
});

export const normalizeAttendance = (attendance: Attendance | AttendanceAPI): Attendance => ({
    ...attendance,
    date: parseDate(attendance.date),
});

export type { Employee, Department, LeaveRequest };
