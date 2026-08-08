import axios from 'axios';

// ----------------Global Axios Client------------
// Automatically attaches cookies to every request and sets the base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // CRITICAL: This allows the backend to read/set our HTTP-only cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
