import { z } from "zod";

const timeStringSchema = z
    .string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
        "Doit être au format HH:MM:SS"
    );

const attendanceBase = {
    id: z.number().int(),
    clockIn: timeStringSchema,
    clockOut: timeStringSchema,
    breakDuration: timeStringSchema,
    workedHours: z.number(),
    overtimeHours: z.number(),
    notes: z.string().nullable().optional(),
    employeeId: z.number().int(),
    employeeName: z.string(),
};

export const attendanceAPICodec = z.object({
    ...attendanceBase,
    date: z.string(),
});
export type AttendanceAPI = z.infer<typeof attendanceAPICodec>;

export const attendanceCodec = z.object({
    ...attendanceBase,
    date: z.coerce.date(),
});
export type Attendance = z.infer<typeof attendanceCodec>;

export const attendanceCreateCodec = z.object({
    date: z.string().datetime({ offset: false }),
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
