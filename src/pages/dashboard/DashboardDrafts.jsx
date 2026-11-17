import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, PenTool, Globe, Calendar, ArrowRight, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import postService from '../../services/postService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const DashboardDrafts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await postService.getMyDrafts({ pageSize: 50 });
      setDrafts(res.content || []);
    } catch (error) {
      toast.error('Failed to load your drafts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handlePublish = async (postId) => {
    if (!(await confirm('Publish this draft? It will be publicly visible to everyone on TechVerse.'))) return;
    setPublishingId(postId);
    try {
      await postService.publishPost(postId);
      toast.success('Draft published successfully!');
      setDrafts(drafts.filter(d => d.postId !== postId));
    } catch (err) {
      toast.error('Failed to publish draft.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!(await confirm('Are you sure you want to delete this draft? This cannot be undone.'))) return;
    try {
      await postService.deletePost(postId);
      setDrafts(drafts.filter(d => d.postId !== postId));
      toast.success('Draft deleted successfully');
    } catch (err) {
      toast.error('Failed to delete draft.');
    }
  };

  const filteredDrafts = drafts.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600';
    }
    return postService.getPostImage(postId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-10 h-10 animate-spin text-techverse-olive mb-3" />
        <p className="text-sm font-medium text-techverse-green/70">Loading your drafts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-techverse-green tracking-tight">Drafts</h1>
          <p className="text-sm text-techverse-green/70 mt-1">
            Privately saved articles waiting to be reviewed or published.
          </p>
        </div>
        <Link
          to="/dashboard/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm w-fit"
        >
          <PenTool size={16} />
          <span>Write New Article</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/40" />
        <input
          type="text"
          placeholder="Filter drafts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-techverse-green/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-techverse-olive text-techverse-green shadow-sm"
        />
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
          <FileText size={48} className="mx-auto text-techverse-green/30 mb-3" />
          <h3 className="text-lg font-bold text-techverse-green mb-1">No drafts found</h3>
          <p className="text-xs text-techverse-green/60 max-w-sm mx-auto mb-6">
            When you save an article as a draft from the editor, it will appear here privately until you are ready to publish.
          </p>
          <Link
            to="/dashboard/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm"
          >
            <PenTool size={14} />
            <span>Start a New Draft</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrafts.map((draft) => (
            <motion.div
              key={draft.postId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-techverse-green/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-techverse-green/10">
                  <img
                    src={getImageUrl(draft.imageName, draft.postId)}
                    alt={draft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                    DRAFT
                  </span>
                  {draft.category && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-sm">
                      {draft.category.categoryTitle}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-techverse-green line-clamp-2 mb-2 group-hover:text-techverse-olive transition-colors">
                    {draft.title}
                  </h3>
                  <p className="text-xs text-techverse-green/70 line-clamp-3 mb-4 leading-relaxed">
                    {(draft.content || '').replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                  </p>
                  <div className="flex items-center text-[11px] text-techverse-green/60 gap-1.5">
                    <Calendar size={13} />
                    <span>Saved: {draft.addedDate ? new Date(draft.addedDate).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-techverse-eggshell/40 border-t border-techverse-green/5 flex items-center justify-between">
                <button
                  onClick={() => handlePublish(draft.postId)}
                  disabled={publishingId === draft.postId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90 transition shadow-sm disabled:opacity-50"
                >
                  {publishingId === draft.postId ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Globe size={13} />
                  )}
                  <span>Publish</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/dashboard/articles/${draft.postId}/edit`}
                    className="p-1.5 text-techverse-green/70 hover:text-techverse-green hover:bg-white rounded-md transition"
                    title="Edit Draft"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(draft.postId)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                    title="Delete Draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardDrafts;

