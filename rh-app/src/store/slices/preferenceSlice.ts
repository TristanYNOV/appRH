import apiClient from "../../HTTP/httpClient.ts";
import type { PreferenceSlice, StoreCreator } from "../types.ts";

export const createPreferenceSlice: StoreCreator<PreferenceSlice> = (set) => ({
    apiBaseUrl: apiClient.getBaseURL(),
    setApiBaseUrl: (url: string) => {
        apiClient.setBaseURL(url);
        set({ apiBaseUrl: url });
    },
});
