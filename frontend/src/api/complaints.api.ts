import api from "@/lib/axios";

export const complaintsApi = {
  raiseComplaint: async (data: Record<string, any>) => {
    const response = await api.post("/complaints", data);
    return response.data;
  },
  
  getMyComplaints: async () => {
    const response = await api.get("/complaints/my");
    return response.data;
  },

  getAllForAssociation: async (associationId: string) => {
    const response = await api.get(`/complaints/association/${associationId}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/complaints/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  }
};
