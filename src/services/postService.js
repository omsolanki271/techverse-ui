import { delay, getDb, setDb } from './mockDb';

const paginateAndSort = (items, params) => {
  const { pageNumber = 0, pageSize = 10, sortBy = 'addedDate', sortDirection = 'desc' } = params || {};
  
  const sorted = [...items].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'addedDate') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const start = pageNumber * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  
  return {
    content: paged,
    pageNumber,
    pageSize,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    lastPage: start + pageSize >= items.length
  };
};

const postService = {
  createPost: async (categoryId, postData) => {
    await delay(600);
    const posts = getDb('posts');
    const categories = getDb('categories');
    
    // In a real app we'd get the user from the token context on backend
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const category = categories.find(c => c.categoryId === categoryId);

    const newPost = {
      postId: `post_${Date.now()}`,
      ...postData,
      addedDate: new Date().toISOString(),
      category: category || null,
      user: {
        id: currentUser.userId || currentUser.id || 'anon',
        name: currentUser.name || 'Anonymous',
        username: currentUser.username || 'anon'
      }
    };
    
    posts.push(newPost);
    setDb('posts', posts);
    return newPost;
  },

  updatePost: async (postId, postData) => {
    await delay(600);
    const posts = getDb('posts');
    const index = posts.findIndex(p => p.postId === postId);
    if (index === -1) throw new Error('Post not found');
    
    posts[index] = { ...posts[index], ...postData };
    setDb('posts', posts);
    return posts[index];
  },

  getAllPosts: async (params = {}) => {
    await delay(400);
    return paginateAndSort(getDb('posts'), params);
  },

  getPostById: async (postId) => {
    await delay(300);
    const post = getDb('posts').find(p => p.postId === postId);
    if (!post) throw new Error('Post not found');
    return post;
  },

  getPostsByUser: async (userId, params = {}) => {
    await delay(400);
    const posts = getDb('posts').filter(p => p.user?.id === userId || p.user?.userId === userId);
    return paginateAndSort(posts, params);
  },

  getPostsByCategory: async (categoryId, params = {}) => {
    await delay(400);
    const posts = getDb('posts').filter(p => p.category?.categoryId === categoryId);
    return paginateAndSort(posts, params);
  },

  searchPosts: async (keyword, params = {}) => {
    await delay(400);
    const lower = keyword.toLowerCase();
    const posts = getDb('posts').filter(p => 
      p.title.toLowerCase().includes(lower) || 
      p.content.toLowerCase().includes(lower)
    );
    return paginateAndSort(posts, params);
  },

  deletePost: async (postId) => {
    await delay(600);
    const posts = getDb('posts');
    setDb('posts', posts.filter(p => p.postId !== postId));
    return { success: true };
  },

  // Simulating image serving by returning the URL directly if it's external, or a placeholder if mocked
  getPostImage: (postId) => {
    const post = getDb('posts').find(p => p.postId === postId);
    if (post && post.imageName && post.imageName !== 'default.png') {
      // If it's a full URL (like from mockData) return it directly
      if (post.imageName.startsWith('http')) return post.imageName;
      // Otherwise mock it
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
  }
};

export default postService;
