import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";
import { EmployeeCodec } from "./employee.codec.ts";

export const DepartmentCodec = BaseEntityCodec.extend({
    name: z.string(),
    code: z.string(),
    description: z.string(),
    employees: z.array(z.lazy(() => EmployeeCodec.omit({ department: true }))).optional().default([]),
}).strict();

export const DepartmentPayloadCodec = DepartmentCodec.partial();

export type Department = z.infer<typeof DepartmentCodec>;
