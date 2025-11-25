import { z } from "zod";

export const authUserSchema = z.object({
    id: z.string().uuid(),
    userName: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string()),
    employeeId: z.union([z.number().int(), z.null()]),
});

export const authLoginPayloadCodec = z.object({
    email: z.string(),
    password: z.string(),
});

export const authRegisterPayloadCodec = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    userName: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    employeeId: z.number(),
});

export const authRegisterAndLoginResponseCodec = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.string(),
    user: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthLoginPayload = z.infer<typeof authLoginPayloadCodec>;
export type AuthRegisterPayload = z.infer<typeof authRegisterPayloadCodec>;
export type AuthRegisterAndLoginResponse = z.infer<
    typeof authRegisterAndLoginResponseCodec
>;
