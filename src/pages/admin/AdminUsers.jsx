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

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-techverse-olive"></div></div>;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-techverse-green">User Management</h1>
        <p className="text-techverse-green/70">View and manage platform users.</p>
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
                    <button onClick={() => toast.info('Edit user feature not fully implemented in UI yet')} className="p-2 text-techverse-olive hover:bg-techverse-olive/10 rounded-full transition-colors inline-block mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id || u.userId)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors inline-block">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
