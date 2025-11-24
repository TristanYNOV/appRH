import { z } from "zod";

export const BaseEntityCodec = z.object({
    id: z.number(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    createdBy: z.string(),
    updatedBy: z.string(),
}).strict();

export type BaseEntity = z.infer<typeof BaseEntityCodec>;
