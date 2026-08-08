import api from "@/lib/axios";

export const authApi = {
  register: async (data: Record<string, any>) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  
  login: async (data: Record<string, any>) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.get("/auth/logout");
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
