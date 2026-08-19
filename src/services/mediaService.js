import api from './api';

const mediaService = {
  uploadMedia: async (userId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('image', file);

    // API maps to POST /api/media/user/{userId}/upload
    const response = await api.post(`/media/user/${userId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          onUploadProgress(progressEvent);
        }
      }
    });
    
    return response.data;
  },

  getAllMedia: async () => {
    const response = await api.get('/media/');
    return response.data;
  },

  getUserMedia: async (userId) => {
    const response = await api.get(`/media/user/${userId}`);
    return response.data;
  },

  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  },

  getMediaUrl: (mediaId) => {
    // Assuming we don't have a direct /media/image endpoint, 
    // but typically it might be served from static resources or similar.
    // If not, we use the VITE_API_BASE_URL.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    return `${baseUrl}/media/file/${mediaId}`;
  }
};

export default mediaService;
