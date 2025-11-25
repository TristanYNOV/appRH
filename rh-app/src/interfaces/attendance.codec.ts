import { z } from "zod";

const timeStringSchema = z
    .string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
        "Doit être au format HH:MM:SS"
    );

export const attendanceAPICodec = z.object({
    id: z.number().int(),
    date: z.string().datetime(),     // "2025-11-26T19:50:34.44Z"
    clockIn: timeStringSchema,
    clockOut: timeStringSchema,
    breakDuration: timeStringSchema,
    workedHours: z.number(),
    overtimeHours: z.number(),
    notes: z.string().nullable().optional(),
    employeeId: z.number().int(),
    employeeName: z.string(),
});
export type AttendanceAPI = z.infer<typeof attendanceAPICodec>;

export const attendanceCreateCodec = z.object({
    date: z.string().datetime(),     // "2025-11-26T19:50:34.4400000Z"
    clockIn: timeStringSchema,
    clockOut: timeStringSchema,
    breakDuration: timeStringSchema,
    notes: z.string().nullable().optional(),
    employeeId: z.number().int(),
});
export type AttendanceCreate = z.infer<typeof attendanceCreateCodec>;
export const attendanceUpdateCodec = attendanceCreateCodec.partial();
export type AttendanceUpdate = z.infer<typeof attendanceUpdateCodec>;

// Routes
// localhost/api/attendance GET & POST
// .../attendances/employee/:employeeId
// .../attendances/employee/:emloyeeId/date/2025-11-26 Search By Employee and date (date is an example)
// .../attendances/date-range?startDate=2025-11-26&endDate=2025-11-27
// .../attendances/:idAttendance GET OR UPDATE OR DELETE
