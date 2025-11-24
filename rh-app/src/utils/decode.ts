import type { ZodTypeAny } from "zod";

const areDeepEqual = (left: unknown, right: unknown) => {
    try {
        return JSON.stringify(left) === JSON.stringify(right);
    } catch {
        return false;
    }
};

const formatValue = (value: unknown) => {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

export const decode = <T>(schema: ZodTypeAny, data: unknown, context: string): T => {
    if (Array.isArray(data) && data.length === 0) {
        console.info(`[DECODE][${context}] Tableau vide reçu, aucune validation nécessaire.`);
        return [] as unknown as T;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
        console.error(`[DECODE][${context}]`, result.error.format());
        throw new Error(`Les données reçues pour ${context} ne respectent pas le contrat attendu.`);
    }

    const parsed = result.data as T;
    if (!areDeepEqual(data, parsed)) {
        console.warn(`[DECODE][${context}] Données ajustées après validation.`, {
            original: formatValue(data),
            parsed: formatValue(parsed),
        });
    }

    return parsed;
};
