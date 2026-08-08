import api from "@/lib/axios";

export const visitorsApi = {
  logVisitor: async (data: Record<string, any>) => {
    const response = await api.post("/visitors", data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/visitors/${id}/status`, { status });
    return response.data;
  },

  getPendingForFlat: async (flatId: string) => {
    const response = await api.get(`/visitors/flat/${flatId}/pending`);
    return response.data;
  },

  getAllForAssociation: async (associationId: string) => {
    const response = await api.get(`/visitors/association/${associationId}`);
    return response.data;
  },
};
