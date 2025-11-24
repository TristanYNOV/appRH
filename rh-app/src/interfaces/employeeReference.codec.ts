import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";

export const EmployeeReferenceCodec = BaseEntityCodec.pick({ id: true })
    .extend({
        uniqueId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        departmentId: z.number().optional(),
    })
    .passthrough();

export type EmployeeReference = z.infer<typeof EmployeeReferenceCodec>;
