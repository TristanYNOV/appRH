import type {BaseEntity} from "./baseEntity.interface.ts";
import type {Department} from "./department.interface.ts";
import type {Attendance} from "./attendance.interface.ts";
import type {LeaveRequest} from "./leaveRequest.interface.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export enum eGender {
    MALE,
    FEMALE
}

export const genderOptions = [eGender.MALE, eGender.FEMALE] as const;

export const genderLabel: Record<eGender, string> = {
    [eGender.MALE]: 'Homme',
    [eGender.FEMALE]: 'Femme',
}

export interface Employee  extends BaseEntity {
    uniqueId: string,
    firstName: string,
    lastName: string,
    gender: eGender,
    email:string,
    phone: string,
    address: string,
    position: string,
    salary: number,
    hireDate: Date,
    departmentId: number,
    department?: Department,
    attendances?: Attendance[],
    leaveRequests?: LeaveRequest[],
}