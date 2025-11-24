import type {ZodTypeAny} from "zod";

export const decode = <T>(schema: ZodTypeAny, data: unknown, context: string): T => {
    if (Array.isArray(data)) {
        const meaningfulItems = data.filter((item) => {
            if (item == null) return false;
            if (typeof item !== "object") return true;
            return Object.keys(item as Record<string, unknown>).length > 0;
        });

        if (meaningfulItems.length === 0) {
            return [] as unknown as T;
        }
    }

    const result = schema.safeParse(data);
    if (!result.success) {
        console.error(`[DECODE][${context}]`, result.error.format());
        throw new Error(`Les données reçues pour ${context} ne respectent pas le contrat attendu.`);
    }

    return result.data as T;
};
