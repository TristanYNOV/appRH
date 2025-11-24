import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";
import { EmployeeReferenceCodec } from "./employeeReference.codec.ts";

export const DepartmentCodec = BaseEntityCodec.extend({
    name: z.string(),
    code: z.string(),
    description: z.string(),
    employees: z.array(EmployeeReferenceCodec).optional().default([]),
}).strict();

export const DepartmentPayloadCodec = DepartmentCodec.partial();

export type Department = z.infer<typeof DepartmentCodec>;
