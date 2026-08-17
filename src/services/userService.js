import { delay, getDb, setDb } from './mockDb';

const userService = {
  getAllUsers: async () => {
    await delay(500);
    return getDb('users');
  },

  deleteUser: async (userId) => {
    await delay(600);
    const users = getDb('users');
    setDb('users', users.filter(u => u.id !== userId && u.userId !== userId));
    return { success: true };
  }
};

export default userService;
