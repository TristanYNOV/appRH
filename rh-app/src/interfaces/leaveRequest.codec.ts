import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";
import { EmployeeReferenceCodec } from "./employeeReference.codec.ts";

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
};

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

export const leaveTypeOptions = [
    LeaveType.Annual,
    LeaveType.Sick,
    LeaveType.Maternity,
    LeaveType.Paternity,
    LeaveType.Personal,
    LeaveType.Unpaid,
];

export const leaveTypeRecord: Record<LeaveType, string> = {
    [LeaveType.Annual]: "Annuel",
    [LeaveType.Sick]: "Maladie",
    [LeaveType.Maternity]: "Maternelle",
    [LeaveType.Paternity]: "Paternité",
    [LeaveType.Personal]: "Personnel",
    [LeaveType.Unpaid]: "Non payée",
};

export const LeaveRequestCodec = BaseEntityCodec.extend({
    leaveType: z.nativeEnum(LeaveType),
    status: z.nativeEnum(LeaveStatus),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    daysRequested: z.number(),
    reason: z.string(),
    managerComment: z.string().optional(),
    reviewedAt: z.coerce.date().optional(),
    reviewedBy: z.coerce.date().optional(),
    employeeId: z.number().optional(),
    employee: EmployeeReferenceCodec.optional(),
}).strict();

export const LeaveRequestPayloadCodec = LeaveRequestCodec.partial();

export type LeaveRequest = z.infer<typeof LeaveRequestCodec>;
