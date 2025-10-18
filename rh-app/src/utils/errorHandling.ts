export const extractErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === "string") {
            return maybeMessage;
        }

        const maybeResponse = (error as { response?: { data?: unknown } }).response;
        if (maybeResponse?.data) {
            if (typeof maybeResponse.data === "string") {
                return maybeResponse.data;
            }

            if (typeof maybeResponse.data === "object" && maybeResponse.data !== null) {
                const dataMessage = (maybeResponse.data as { message?: unknown }).message;
                if (typeof dataMessage === "string") {
                    return dataMessage;
                }

                const title = (maybeResponse.data as { title?: unknown }).title;
                if (typeof title === "string") {
                    return title;
                }
            }
        }
    }

    return "Une erreur est survenue";
};
