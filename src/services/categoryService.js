import { delay, getDb, setDb } from './mockDb';

const categoryService = {
  getAllCategories: async () => {
    await delay(300);
    return getDb('categories');
  },

  getCategoryById: async (categoryId) => {
    await delay(200);
    const category = getDb('categories').find(c => c.categoryId === categoryId);
    if (!category) throw new Error('Category not found');
    return category;
  },

  createCategory: async (categoryData) => {
    await delay(500);
    const categories = getDb('categories');
    const newCategory = {
      categoryId: `cat_${Date.now()}`,
      ...categoryData
    };
    categories.push(newCategory);
    setDb('categories', categories);
    return newCategory;
  },

  updateCategory: async (categoryId, categoryData) => {
    await delay(500);
    const categories = getDb('categories');
    const index = categories.findIndex(c => c.categoryId === categoryId);
    if (index === -1) throw new Error('Category not found');
    
    categories[index] = { ...categories[index], ...categoryData };
    setDb('categories', categories);
    return categories[index];
  },

  deleteCategory: async (categoryId) => {
    await delay(500);
    const categories = getDb('categories');
    setDb('categories', categories.filter(c => c.categoryId !== categoryId));
    return { success: true };
  }
};

export default categoryService;
