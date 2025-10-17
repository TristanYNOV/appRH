import type {BaseEntity} from "./baseEntity.interface.ts";
import type {Employee} from "./employee.interface.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export enum LeaveStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
}

export const leaveStatusOptions = [LeaveStatus.Pending, LeaveStatus.Approved, LeaveStatus.Rejected, LeaveStatus.Cancelled];

export const leaveStatusRecord: Record<LeaveStatus, string> = {
    [LeaveStatus.Pending]: "En attente",
    [LeaveStatus.Approved]: "Approuvée",
    [LeaveStatus.Rejected]: "Rejettée",
    [LeaveStatus.Cancelled]: "Annulée",
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export enum LeaveType {
    Annual = 1,
    Sick = 2,
    Maternity = 3,
    Paternity = 4,
    Personal = 5,
    Unpaid = 6,
}

export const leaveTypeOptions = [LeaveType.Annual, LeaveType.Sick, LeaveType.Maternity, LeaveType.Paternity, LeaveType.Personal, LeaveType.Unpaid];

export const leaveTypeRecord: Record<LeaveType, string> = {
    [LeaveType.Annual]: 'Annuel',
    [LeaveType.Sick]: 'Maladie',
    [LeaveType.Maternity]: 'Maternelle',
    [LeaveType.Paternity]: 'Paternité',
    [LeaveType.Personal]: 'Personnel',
    [LeaveType.Unpaid]: 'Non payée',
};

export interface LeaveRequest extends BaseEntity {
    leaveType: LeaveType;
    status: LeaveStatus;
    startDate: Date,
    endDate: Date,
    daysRequested: number,
    reason: string,
    managerComment?: string,
    reviewedAt?: Date,
    reviewedBy?: Date,
    employeeId?: number,
    employee?: Employee,
}