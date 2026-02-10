// utils/getSessionUser.js
import axios from 'axios';

export const getSessionUser = async () => {
  try {
    const response = await axios.get('/api/auth/session', { withCredentials: true });
    const { username, status } = response.data;

    if (username && status) {
      return { username, status };
    } else {
      return null;
    }
  } catch (error) {
    console.error('⚠️ Error fetching session:', error);
    return null;
  }
};
