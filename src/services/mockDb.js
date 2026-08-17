import { categories, authors, articles, currentUser } from '../data/mockData';

// Helper to simulate network latency
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const initDb = () => {
  if (!localStorage.getItem('techverse_initialized')) {
    // Transform mock articles into backend shape
    const posts = articles.map(a => ({
      postId: a.id,
      title: a.title,
      content: a.content,
      imageName: a.coverImage,
      addedDate: a.publishedDate,
      category: categories.find(c => c.id === a.categoryId) ? {
        categoryId: a.categoryId,
        categoryTitle: categories.find(c => c.id === a.categoryId).name,
        categoryDescription: categories.find(c => c.id === a.categoryId).description
      } : null,
      user: {
        id: a.authorId,
        name: authors.find(au => au.id === a.authorId)?.name || 'Unknown',
        username: authors.find(au => au.id === a.authorId)?.username || 'unknown',
        about: authors.find(au => au.id === a.authorId)?.bio || ''
      }
    }));

    // Transform categories
    const backendCategories = categories.map(c => ({
      categoryId: c.id,
      categoryTitle: c.name,
      categoryDescription: c.description
    }));

    // Generate some mock comments
    const comments = posts.map(p => ({
      commentId: `com_${Math.random().toString(36).substr(2, 9)}`,
      content: 'This is a great article! Really insightful.',
      postId: p.postId,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username
      },
      addedDate: new Date().toISOString()
    }));

    // Initial user base
    const users = [
      {
        id: currentUser.id,
        userId: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        password: 'password', // mock password
        roles: [{ id: 1, name: 'ROLE_ADMIN' }, { id: 2, name: 'ROLE_USER' }]
      }
    ];
    
    // Add authors to users
    authors.forEach(a => {
      if (!users.find(u => u.id === a.id)) {
        users.push({
          id: a.id,
          userId: a.id,
          name: a.name,
          username: a.username,
          email: `${a.username}@example.com`,
          password: 'password',
          roles: [{ id: 2, name: 'ROLE_USER' }]
        });
      }
    });

    localStorage.setItem('posts', JSON.stringify(posts));
    localStorage.setItem('categories', JSON.stringify(backendCategories));
    localStorage.setItem('comments', JSON.stringify(comments));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('media', JSON.stringify([]));
    
    localStorage.setItem('techverse_initialized', 'true');
  }
};

// Initialize immediately when imported
initDb();

export const getDb = (collection) => {
  return JSON.parse(localStorage.getItem(collection) || '[]');
};

export const setDb = (collection, data) => {
  localStorage.setItem(collection, JSON.stringify(data));
};
