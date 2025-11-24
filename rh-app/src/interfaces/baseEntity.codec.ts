import { z } from "zod";

export const BaseEntityCodec = z.object({
    id: z.number(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
}).strict();

export type BaseEntity = z.infer<typeof BaseEntityCodec>;
