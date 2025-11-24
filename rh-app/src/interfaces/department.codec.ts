import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";

export const DepartmentAPICodec = BaseEntityCodec.extend({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string(),
}).strict();

export const updateDepartmentCodec = z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),
});

export const createDepartmentCodec = z.object({
    name: z.string(),
    code: z.string(),
    description: z.string().optional(),
});

export type Department = z.infer<typeof DepartmentAPICodec>;
export type CreateDepartmentPayload = z.infer<typeof createDepartmentCodec>;
export type UpdateDepartmentPayload = z.infer<typeof updateDepartmentCodec>;
