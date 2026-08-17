import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import mediaService from '../../services/mediaService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MyMedia = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const userId = user.userId || user.id;
        // Normal user gets their own media. Admin gets all (as an example, but prompt says "For USER: Display only their own media. For ADMIN: Display accessible media").
        const res = isAdmin() ? await mediaService.getAllMedia() : await mediaService.getUserMedia(userId);
        setMediaItems(res || []);
      } catch (err) {
        toast.error('Failed to load media library');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMedia();
  }, [user, isAdmin, toast]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const userId = user.userId || user.id;
      const newMedia = await mediaService.uploadMedia(userId, file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      setMediaItems([newMedia, ...mediaItems]);
      toast.success('Media uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await mediaService.deleteMedia(mediaId);
      setMediaItems(mediaItems.filter(m => m.mediaId !== mediaId));
      toast.success('Media deleted successfully');
    } catch (err) {
      // Handle the specific ResourceAlreadyInUseException error
      if (err.response?.status === 400 || err.response?.status === 403 || err.response?.data?.message?.includes('use')) {
        toast.error('This image cannot be deleted because it is currently used by a blog post.');
      } else {
        toast.error('Failed to delete media');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-techverse-green tracking-tight">Media Library</h1>
          <p className="text-base opacity-70 mt-1 text-techverse-green font-medium">Manage your uploaded images.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".jpg,.jpeg,.png,.gif,.webp" 
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary py-2.5 px-6 shadow-md flex items-center justify-center w-full md:w-auto"
          >
            {uploading ? (
              <>{uploadProgress}% <span className="animate-pulse ml-2">Uploading...</span></>
            ) : (
              <><UploadCloud size={18} className="mr-2" /> Upload Image</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive"></div>
        </div>
      ) : mediaItems.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {mediaItems.map(media => (
            <motion.div 
              key={media.mediaId}
              variants={itemVariants}
              className="bg-white rounded-xl overflow-hidden border border-techverse-green/10 shadow-sm group relative"
            >
              <div className="aspect-square bg-techverse-eggshell relative">
                <img 
                  src={mediaService.getMediaUrl(media.mediaId) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400'} 
                  alt={media.fileName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400'; }}
                />
                <div className="absolute inset-0 bg-techverse-green/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(media.mediaId)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete Image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-techverse-green truncate" title={media.fileName}>{media.fileName}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-techverse-green/60 uppercase">{media.fileType || 'IMAGE'}</p>
                  <p className="text-xs text-techverse-green/60">{new Date(media.uploadedDate || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-techverse-green/20 rounded-3xl bg-white/40 min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-techverse-eggshell flex items-center justify-center text-techverse-olive mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-techverse-green mb-2">No media found</h3>
          <p className="text-techverse-green/60 mb-6 text-center max-w-md">You haven't uploaded any images yet. Upload your first image to use in your blog posts.</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-outline px-6 py-2">
            Upload Image
          </button>
        </div>
      )}
    </div>
  );
};

export default MyMedia;
