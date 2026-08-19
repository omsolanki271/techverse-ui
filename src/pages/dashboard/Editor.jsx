import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, Layout, Settings, CheckCircle2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import mediaService from '../../services/mediaService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Media handling
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        setCategories(cats || []);
        if (cats?.length > 0 && !categoryId) {
          setCategoryId(cats[0].categoryId);
        }
      } catch (err) {
        toast.error('Failed to load categories');
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const post = await postService.getPostById(id);
          setTitle(post.title);
          setContent(post.content);
          if (post.category) setCategoryId(post.category.categoryId);
          if (post.imageName && post.imageName !== 'default.png') {
            setMediaPreview(postService.getPostImage(post.postId));
          }
        } catch (err) {
          toast.error('Failed to load post for editing');
          navigate('/dashboard/articles');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Title, content, and category are required.');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        content,
        ...(selectedMediaId && { mediaId: selectedMediaId })
      };

      if (id) {
        await postService.updatePost(id, postData);
        toast.success('Post updated successfully');
      } else {
        await postService.createPost(categoryId, postData);
        toast.success('Post created successfully');
      }
      navigate('/dashboard/articles');
    } catch (err) {
      console.error('Save post error:', err);
      if (err.response?.data) {
        if (typeof err.response.data === 'object' && !err.response.data.message && !err.response.data.success) {
          const errors = Object.values(err.response.data);
          toast.error(errors[0] || 'Validation failed');
        } else {
          toast.error(err.response.data.message || 'Failed to save post');
        }
      } else {
        toast.error('Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  };

  const openMediaModal = async () => {
    setShowMediaModal(true);
    if (mediaItems.length === 0) {
      setLoadingMedia(true);
      try {
        const userId = user?.userId || user?.id;
        const items = await mediaService.getUserMedia(userId);
        setMediaItems(items || []);
      } catch (err) {
        toast.error('Failed to load media library');
      } finally {
        setLoadingMedia(false);
      }
    }
  };

  const selectMediaItem = (media) => {
    setSelectedMediaId(media.mediaId);
    setMediaPreview(mediaService.getMediaUrl(media.mediaId));
    setShowMediaModal(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-techverse-olive" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 relative">
      
      {/* Main Canvas */}
      <motion.div 
        layout
        className="flex-1 bg-white rounded-3xl shadow-sm border border-techverse-green/10 flex flex-col overflow-hidden min-h-[700px]"
      >
        {/* Top Editor Toolbar */}
        <div className="h-16 border-b border-techverse-green/5 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${saving ? 'bg-techverse-olive animate-pulse' : 'bg-techverse-green'}`}></div>
            <span className="text-xs font-bold text-techverse-green opacity-60 uppercase tracking-wider">
              {id ? 'Editing Post' : 'New Post'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-1.5 px-5 text-sm rounded-full shadow-md disabled:opacity-50 flex items-center"
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              {id ? 'Update' : 'Publish'}
            </button>
            <button 
              className={`p-2 rounded-full transition-colors ${sidebarOpen ? 'bg-techverse-olive text-techverse-green' : 'bg-techverse-eggshell text-techverse-green hover:bg-techverse-green/10'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Writing Surface */}
        <div className="flex-1 overflow-y-auto px-6 py-12 sm:px-12 lg:px-20 scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <textarea
              placeholder="Article Title..."
              className="w-full text-4xl sm:text-5xl lg:text-6xl font-black bg-transparent border-none focus:ring-0 resize-none text-techverse-green placeholder-techverse-green/20 leading-tight"
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ minHeight: '80px' }}
            />

            <textarea
              placeholder="Start writing your story here..."
              className="w-full text-lg leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[500px] text-techverse-green/80 placeholder-techverse-green/20 mt-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Settings Side Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0, x: 20 }}
            animate={{ width: 340, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 20 }}
            className="hidden lg:flex flex-col bg-white rounded-3xl shadow-sm border border-techverse-green/10 overflow-hidden flex-shrink-0"
          >
            <div className="p-6 overflow-y-auto w-[340px] h-full scrollbar-hide">
              <h3 className="text-xl font-bold text-techverse-green mb-8 flex items-center">
                <Layout size={20} className="mr-2 text-techverse-olive" />
                Publish Settings
              </h3>
              
              <div className="space-y-8">
                
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-techverse-green/60 mb-2">Category</label>
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-techverse-eggshell/50 rounded-xl text-sm border border-transparent focus:border-techverse-olive focus:ring-0 text-techverse-green outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryTitle}</option>
                    ))}
                  </select>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-techverse-green/60 mb-2 flex justify-between items-center">
                    Cover Image
                    {mediaPreview && (
                      <button onClick={() => { setMediaPreview(null); setSelectedMediaId(null); }} className="text-red-400 hover:text-red-500 flex items-center">
                        <X size={14} className="mr-1" /> Remove
                      </button>
                    )}
                  </label>
                  
                  {mediaPreview ? (
                    <div className="relative rounded-xl overflow-hidden h-40 border border-techverse-green/10">
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div 
                      onClick={openMediaModal}
                      className="border-2 border-dashed border-techverse-green/20 rounded-2xl p-8 text-center bg-techverse-eggshell/30 hover:bg-techverse-eggshell/70 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon size={20} className="text-techverse-olive" />
                      </div>
                      <p className="text-xs font-medium text-techverse-green/70">Select from Media Library</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Selector Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-techverse-green/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-techverse-green">Select Media</h2>
              <button onClick={() => setShowMediaModal(false)} className="p-2 hover:bg-techverse-eggshell rounded-full transition-colors">
                <X size={24} className="text-techverse-green/60" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-techverse-eggshell/30">
              {loadingMedia ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-techverse-olive" />
                </div>
              ) : mediaItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaItems.map(item => (
                    <div 
                      key={item.mediaId} 
                      onClick={() => selectMediaItem(item)}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-techverse-olive cursor-pointer group relative bg-white shadow-sm"
                    >
                      <img 
                        src={mediaService.getMediaUrl(item.mediaId)} 
                        alt={item.fileName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-techverse-green/0 group-hover:bg-techverse-green/20 transition-colors flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto mb-4 text-techverse-green/30" />
                  <p className="text-techverse-green/60">No media found. Go to "My Media" to upload images first.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default Editor;
