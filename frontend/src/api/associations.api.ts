import api from "@/lib/axios";

export const associationsApi = {
  create: async (data: Record<string, any>) => {
    const response = await api.post("/associations", data);
    return response.data;
  },
  
  getMyAssociations: async () => {
    const response = await api.get("/associations");
    return response.data;
  },
};
