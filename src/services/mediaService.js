import { delay, getDb, setDb } from './mockDb';

const mediaService = {
  uploadMedia: async (userId, file, onUploadProgress) => {
    // Simulate upload progress
    if (onUploadProgress) {
      for (let i = 1; i <= 10; i++) {
        await delay(100);
        onUploadProgress({
          loaded: i * 10,
          total: 100
        });
      }
    } else {
      await delay(1000);
    }
    
    const mediaList = getDb('media');
    
    // For mock, we can't reliably store the real file in localStorage without exceeding quotas quickly.
    // Instead, we will simulate it by storing a random tech-related placeholder image.
    // In a real session without refresh, we could use URL.createObjectURL(file), but it breaks on reload.
    // So we just assign a high-quality mockup URL.
    
    const mockImageId = Math.floor(Math.random() * 1000);
    const mockUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&sig=${mockImageId}`;

    const newMedia = {
      mediaId: `media_${Date.now()}`,
      fileName: file.name,
      fileType: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
      fileSize: file.size,
      uploadedDate: new Date().toISOString(),
      user: { userId },
      mockUrl // Storing the simulated URL directly
    };
    
    mediaList.push(newMedia);
    setDb('media', mediaList);
    return newMedia;
  },

  getAllMedia: async () => {
    await delay(400);
    const media = getDb('media');
    return media.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
  },

  getUserMedia: async (userId) => {
    await delay(300);
    const media = getDb('media').filter(m => m.user?.userId === userId);
    return media.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
  },

  deleteMedia: async (mediaId) => {
    await delay(500);
    // Check if used by a post
    const posts = getDb('posts');
    const isUsed = posts.some(p => p.imageName === mediaId);
    
    if (isUsed) {
      const error = new Error('Resource in use');
      error.response = { status: 400, data: { message: 'Image is in use' } };
      throw error;
    }
    
    const mediaList = getDb('media');
    setDb('media', mediaList.filter(m => m.mediaId !== mediaId));
    return { success: true };
  },

  getMediaUrl: (mediaId) => {
    const media = getDb('media').find(m => m.mediaId === mediaId);
    return media?.mockUrl || `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800`;
  }
};

export default mediaService;
