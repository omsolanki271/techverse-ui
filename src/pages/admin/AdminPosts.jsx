import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import postService from '../../services/postService';
import { useToast } from '../../context/ToastContext';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getAllPosts({ pageSize: 100 });
      setPosts(data.content || []);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(p => p.postId !== postId));
      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-techverse-olive"></div></div>;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-techverse-green">Post Management</h1>
        <p className="text-techverse-green/70">Manage all articles across the platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-techverse-green/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-techverse-eggshell/50 border-b border-techverse-green/10 text-sm">
                <th className="p-4 font-bold text-techverse-green uppercase">ID</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Title</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Author</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Category</th>
                <th className="p-4 font-bold text-techverse-green uppercase">Date</th>
                <th className="p-4 font-bold text-techverse-green uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.postId} className="border-b border-techverse-green/5 hover:bg-techverse-eggshell/20">
                  <td className="p-4 text-sm text-techverse-green/70">{p.postId}</td>
                  <td className="p-4 font-medium text-techverse-green max-w-[300px] truncate">{p.title}</td>
                  <td className="p-4 text-sm text-techverse-green/80">{p.user?.name || p.user?.username || 'Unknown'}</td>
                  <td className="p-4 text-sm text-techverse-green/80">
                    <span className="bg-techverse-olive/20 text-techverse-green px-2 py-1 rounded-sm text-xs font-bold uppercase">
                      {p.category?.categoryTitle || 'None'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-techverse-green/70">{new Date(p.addedDate).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link to={`/article/${p.postId}`} className="p-2 text-techverse-olive hover:bg-techverse-olive/10 rounded-full transition-colors inline-block mr-1">
                      <Eye size={16} />
                    </Link>
                    <Link to={`/dashboard/articles/${p.postId}/edit`} className="p-2 text-techverse-olive hover:bg-techverse-olive/10 rounded-full transition-colors inline-block mr-1">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(p.postId)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors inline-block">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="p-8 text-center text-techverse-green/60">No posts found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPosts;
