import { z } from "zod";

import { AttendanceCodec } from "./attendance.codec.ts";
import { BaseEntityCodec } from "./baseEntity.codec.ts";
import { DepartmentCodec } from "./department.codec.ts";
import { LeaveRequestCodec } from "./leaveRequest.codec.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export enum eGender {
    MALE = 1,
    FEMALE = 2,
}

export const genderOptions = [eGender.MALE, eGender.FEMALE] as const;

export const genderLabel: Record<eGender, string> = {
    [eGender.MALE]: "Homme",
    [eGender.FEMALE]: "Femme",
};

const employeeCoreCodec = BaseEntityCodec.extend({
    uniqueId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.nativeEnum(eGender),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    position: z.string(),
    salary: z.number(),
    hireDate: z.coerce.date(),
    departmentId: z.number(),
});

export const EmployeeReferenceCodec = BaseEntityCodec.pick({ id: true })
    .extend({
        uniqueId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        departmentId: z.number().optional(),
    })
    .passthrough();

const employeeRelationsCodec = z.object({
    department: z.lazy(() => DepartmentCodec.omit({ employees: true })).optional(),
    attendances: z.array(z.lazy(() => AttendanceCodec.omit({ employee: true }))).optional().default([]),
    leaveRequests: z.array(z.lazy(() => LeaveRequestCodec.omit({ employee: true }))).optional().default([]),
});

export const EmployeeCodec = employeeCoreCodec.merge(employeeRelationsCodec).strict();

export const EmployeePayloadCodec = EmployeeCodec.partial();

export type Employee = z.infer<typeof EmployeeCodec>;
