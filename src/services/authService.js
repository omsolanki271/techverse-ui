import { delay, getDb, setDb } from './mockDb';

const authService = {
  login: async (username, password) => {
    await delay(600);
    const users = getDb('users');
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
    
    if (user) {
      // Mock JWT token
      const token = `mock_token_${user.id}_${Date.now()}`;
      return {
        token,
        user
      };
    }
    
    const error = new Error('Invalid username or password');
    error.response = { data: { message: 'Invalid username or password' } };
    throw error;
  },

  register: async (userData) => {
    await delay(800);
    const users = getDb('users');
    
    if (users.find(u => u.username === userData.username || u.email === userData.email)) {
      const error = new Error('User already exists');
      error.response = { data: { message: 'Username or Email already exists!' } };
      throw error;
    }
    
    const newUser = {
      id: `u_${Date.now()}`,
      userId: `u_${Date.now()}`,
      ...userData,
      roles: [{ id: 2, name: 'ROLE_USER' }]
    };
    
    users.push(newUser);
    setDb('users', users);
    
    return newUser;
  }
};

export default authService;
