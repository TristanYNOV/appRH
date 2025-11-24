import { z } from "zod";

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

export const EmployeeAPICodec = z
    .object({
        id: z.number(),
        uniqueId: z.string(),
        fullName: z.string(),
        gender: z.nativeEnum(eGender),
        email: z.string().email(),
        phoneNumber: z.string(),
        address: z.string(),
        position: z.string(),
        salary: z.number(),
        departmentName: z.string(),
        hireDate: z.coerce.date(),
    })
    .strict();

export const createEmployeeCodec = z.object({
    firstName: z.string(),
    lastName: z.string(),
    gender: z.nativeEnum(eGender),
    email: z.string().email(),
    phoneNumber: z.string(),
    address: z.string(),
    position: z.string(),
    salary: z.number(),
    departmentId: z.number(),
    hireDate: z.coerce.date(),
});

export const updateEmployeeCodec = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.nativeEnum(eGender).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    position: z.string().optional(),
    salary: z.number().optional(),
    departmentId: z.number().optional(),
    hireDate: z.coerce.date().optional(),
});

export type Employee = z.infer<typeof EmployeeAPICodec>;
export type CreateEmployeePayload = z.infer<typeof createEmployeeCodec>;
export type UpdateEmployeePayload = z.infer<typeof updateEmployeeCodec>;

export { EmployeeReferenceCodec } from "./employeeReference.codec.ts";
