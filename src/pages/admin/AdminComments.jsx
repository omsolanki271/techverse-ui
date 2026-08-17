import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import commentService from '../../services/commentService';
import { useToast } from '../../context/ToastContext';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const data = await commentService.getAllComments();
      setComments(data || []);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c.commentId !== commentId && c.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-techverse-olive"></div></div>;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-techverse-green">Comment Management</h1>
        <p className="text-techverse-green/70">Moderate comments across the platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-techverse-eggshell/50 border-b border-techverse-green/10 text-sm">
                <th className="p-4 font-bold text-techverse-green uppercase">ID</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Author</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Content</th>
                <th className="p-4 font-bold text-techverse-green uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.id || c.commentId} className="border-b border-techverse-green/5 hover:bg-techverse-eggshell/20">
                  <td className="p-4 text-sm text-techverse-green/70">{c.id || c.commentId}</td>
                  <td className="p-4 text-sm text-techverse-green/80 font-medium">{c.user?.name || c.user?.username || 'Unknown'}</td>
                  <td className="p-4 text-sm text-techverse-green max-w-[400px] truncate">{c.content}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id || c.commentId)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors inline-block">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {comments.length === 0 && <div className="p-8 text-center text-techverse-green/60">No comments found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminComments;
