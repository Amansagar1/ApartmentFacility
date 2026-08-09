import api from "@/lib/axios";

export const supportApi = {
  create: async (data: { title: string; description: string; priority: string }) => {
    const response = await api.post("/support", data);
    return response.data;
  },
  
  getMyTickets: async () => {
    const response = await api.get("/support");
    return response.data;
  },

  getTicketDetails: async (ticketId: string) => {
    const response = await api.get(`/support/${ticketId}`);
    return response.data;
  },

  addMessage: async (ticketId: string, content: string) => {
    const response = await api.post(`/support/${ticketId}/messages`, { content });
    return response.data;
  },

  updateStatus: async (ticketId: string, status: string) => {
    const response = await api.put(`/support/${ticketId}/status`, { status });
    return response.data;
  }
};
