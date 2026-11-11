import api, { getBaseApiUrl } from './api';

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

  getMediaById: async (mediaId) => {
    const response = await api.get(`/media/${mediaId}`);
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

  fetchMediaBlobUrl: async (mediaId) => {
    const response = await api.get(`/media/file/${mediaId}`, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  },

  getMediaUrl: (mediaId) => {
    return `${getBaseApiUrl()}/media/file/${mediaId}`;
  }
};

export default mediaService;
