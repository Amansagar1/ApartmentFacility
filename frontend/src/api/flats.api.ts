import api from "@/lib/axios";

export const flatsApi = {
  create: async (data: Record<string, any>) => {
    const response = await api.post("/flats", data);
    return response.data;
  },
  
  getByAssociationId: async (associationId: string) => {
    const response = await api.get(`/flats/${associationId}`);
    return response.data;
  },
  
  update: async (id: string, data: Record<string, any>) => {
    const response = await api.put(`/flats/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/flats/${id}`);
    return response.data;
  }
};
