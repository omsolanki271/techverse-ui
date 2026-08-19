import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const confirm = useConfirm();

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', about: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!(await confirm('Are you sure you want to delete this user?'))) return;
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId && u.userId !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const openAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({ name: '', email: '', about: '', password: '' });
  };

  const openEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || user.username || '',
      email: user.email || '',
      about: user.about || 'User of TechVerse',
      password: ''
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.about) {
      toast.error('All fields including password are required');
      return;
    }
    if (formData.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'edit') {
        const id = selectedUser.id || selectedUser.userId;
        const updatedUser = await userService.updateUser(id, formData);
        setUsers(users.map(u => (u.id === id || u.userId === id) ? { ...u, ...updatedUser } : u));
        toast.success('User updated successfully');
      } else {
        const newUser = await userService.createUser(formData);
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-techverse-olive"></div></div>;

  return (
    <div className="space-y-6 relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-techverse-green">User Management</h1>
          <p className="text-techverse-green/70">View and manage platform users.</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2 text-sm flex items-center">
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-techverse-eggshell/50 border-b border-techverse-green/10 text-sm">
                <th className="p-4 font-bold text-techverse-green uppercase">ID</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Name</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Email</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Roles</th>
                <th className="p-4 font-bold text-techverse-green uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u.userId} className="border-b border-techverse-green/5 hover:bg-techverse-eggshell/20">
                  <td className="p-4 text-sm text-techverse-green/70">{u.id || u.userId}</td>
                  <td className="p-4 font-medium text-techverse-green">{u.name || u.username}</td>
                  <td className="p-4 text-sm text-techverse-green/80">{u.email}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {(u.roles || []).map(r => (
                        <span key={r.id} className={`text-xs px-2 py-1 rounded-sm font-bold ${r.name === 'ROLE_ADMIN' ? 'bg-techverse-green text-techverse-eggshell' : 'bg-techverse-olive/20 text-techverse-green'}`}>
                          {r.name.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(u)} className="p-2 text-techverse-olive hover:bg-techverse-olive/10 rounded-full transition-colors inline-block mr-2" title="Edit User">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id || u.userId)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors inline-block" title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-techverse-green/10 flex justify-between items-center bg-techverse-eggshell">
              <h2 className="text-xl font-bold text-techverse-green">{modalMode === 'edit' ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={closeModal} className="text-techverse-green/60 hover:text-techverse-green font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-techverse-green mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-techverse-olive focus:border-techverse-olive"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-techverse-green mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-techverse-olive focus:border-techverse-olive"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-techverse-green mb-1">About</label>
                <textarea 
                  value={formData.about} 
                  onChange={e => setFormData({...formData, about: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-techverse-olive focus:border-techverse-olive h-20 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-techverse-green mb-1">{modalMode === 'edit' ? 'New Password' : 'Password'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-techverse-olive focus:border-techverse-olive"
                  placeholder="Required by system"
                  required
                />
                {modalMode === 'edit' && (
                  <p className="text-xs text-techverse-green/60 mt-1">Due to system constraints, a new password must be provided to update the user profile.</p>
                )}
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-techverse-green hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-4 py-2 flex items-center">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
