import api from './axios';

export const usersApi = {
  // Create a new user (Super Admin only)
  createUser: async (data: {
    fullName: string;
    email: string;
    password?: string;
    role: string;
    associationId?: string;
    phone?: string;
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Get all users (Super Admin only)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};
