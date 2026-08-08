import api from "@/lib/axios";

export const noticesApi = {
  create: async (data: Record<string, any>) => {
    const response = await api.post("/notices", data);
    return response.data;
  },
  
  getAllForAssociation: async (associationId: string) => {
    const response = await api.get(`/notices/association/${associationId}`);
    return response.data;
  },

  update: async (id: string, data: Record<string, any>) => {
    const response = await api.put(`/notices/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  }
};
