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

  getAll: async () => {
    const response = await api.get("/associations/all");
    return response.data;
  },

  getMembers: async (associationId: string) => {
    const response = await api.get(`/associations/${associationId}/members`);
    return response.data;
  },

  updateMembership: async (associationId: string, userId: string, data: { status?: string, role?: string }) => {
    const response = await api.put(`/associations/${associationId}/members/${userId}`, data);
    return response.data;
  }
};
