import type {BaseEntity} from "./baseEntity.interface.ts";
import type {Employee} from "./employee.interface.ts";

export interface Attendance extends BaseEntity {
    dateTime: Date,
    clockIn: string,
    clockOut: string,
    breakDuration: string,
    workedHour: number,
    overtimeHours: number,
    notes: string,
    employeeId?: number,
    employee?: Employee
}