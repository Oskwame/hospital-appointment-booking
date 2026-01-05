export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { "Authorization": `Bearer ${token}` } : {};
};