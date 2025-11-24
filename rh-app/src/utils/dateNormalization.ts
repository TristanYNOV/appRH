import type { Department } from "../interfaces/department.codec.ts";
import type { Employee } from "../interfaces/employee.codec.ts";
import type { LeaveRequest } from "../interfaces/leaveRequest.codec.ts";

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
    employees: Array.isArray(department.employees) ? department.employees : [],
});

export const normalizeEmployee = (employee: Employee): Employee => ({
    ...employee,
    hireDate: parseDate(employee.hireDate),
    createdAt: parseDate(employee.createdAt),
    updatedAt: parseDate(employee.updatedAt),
    department: employee.department
        ? {
              ...employee.department,
              createdAt: parseDate(employee.department.createdAt),
              updatedAt: parseDate(employee.department.updatedAt),
              employees: [],
          }
        : undefined,
    attendances: Array.isArray(employee.attendances)
        ? employee.attendances.map((attendance: Employee["attendances"][number]) => ({
              ...attendance,
              dateTime: parseDate(attendance.dateTime),
              createdAt: parseDate(attendance.createdAt),
              updatedAt: parseDate(attendance.updatedAt),
          }))
        : [],
    leaveRequests: Array.isArray(employee.leaveRequests)
        ? employee.leaveRequests.map((leave: Employee["leaveRequests"][number]) => ({
              ...leave,
              startDate: parseDate(leave.startDate),
              endDate: parseDate(leave.endDate),
              createdAt: parseDate(leave.createdAt),
              updatedAt: parseDate(leave.updatedAt),
              reviewedAt: leave.reviewedAt ? parseDate(leave.reviewedAt) : undefined,
          }))
        : [],
});

export type { Employee, Department, LeaveRequest };
