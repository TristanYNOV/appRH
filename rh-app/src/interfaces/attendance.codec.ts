import { z } from "zod";

import { BaseEntityCodec } from "./baseEntity.codec.ts";
import { EmployeeReferenceCodec } from "./employeeReference.codec.ts";

export const AttendanceCodec = BaseEntityCodec.extend({
    dateTime: z.coerce.date(),
    clockIn: z.string(),
    clockOut: z.string(),
    breakDuration: z.string(),
    workedHour: z.number(),
    overtimeHours: z.number(),
    notes: z.string(),
    employeeId: z.number().optional(),
    employee: EmployeeReferenceCodec.optional(),
}).strict();

export const AttendancePayloadCodec = AttendanceCodec.partial();

export type Attendance = z.infer<typeof AttendanceCodec>;
