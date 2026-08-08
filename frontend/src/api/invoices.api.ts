import api from "@/lib/axios";

export const invoicesApi = {
  generate: async (data: Record<string, any>) => {
    const response = await api.post("/billing/generate", data);
    return response.data;
  },
  
  getMyInvoices: async () => {
    const response = await api.get("/billing/my");
    return response.data;
  },

  getAllForAssociation: async (associationId: string) => {
    const response = await api.get(`/billing/association/${associationId}`);
    return response.data;
  },

  createOrder: async (invoiceId: string) => {
    const response = await api.post(`/billing/${invoiceId}/create-order`);
    return response.data;
  },

  verifyPayment: async (invoiceId: string, data: Record<string, any>) => {
    const response = await api.post(`/billing/${invoiceId}/verify-payment`, data);
    return response.data;
  },

  update: async (id: string, data: Record<string, any>) => {
    const response = await api.put(`/billing/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/billing/${id}`);
    return response.data;
  }
};
