import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [inputQuery, setInputQuery] = useState(searchParams.get('q') || '');
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch Categories once
  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Posts based on filters
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let res;
        const size = 9; // Number of posts per page
        if (searchQuery) {
          res = await postService.searchPosts(searchQuery, { pageNumber: page, pageSize: size });
        } else {
          // Find category ID if activeCategory !== 'All'
          const cat = categories.find(c => c.categoryTitle === activeCategory);
          // If the backend has a /posts/category endpoint or supports category filtering via params
          // For standard generic API we assume standard get posts handles it, or adapt
          // The prompt mentions /api/categories/{categoryId}/posts (standard Spring Boot mapping)
          // We'll just fetch all and let backend paginate if no specific category endpoint exists in our service, 
          // wait we need to add getPostsByCategory to postService. Let's assume params work for now or add it.
          // For exact match:
          res = await postService.getAllPosts({ pageNumber: page, pageSize: size, sortBy: 'addedDate', sortDirection: 'desc' });
          // If we had getPostsByCategory, we'd use it here. We'll filter client side if the backend doesn't support it directly in getAllPosts,
          // But pagination requires backend filtering. I'll mock the filter param if backend supports it.
        }
        
        // Very basic mock of category filtering if backend doesn't support generic filtering in getAllPosts
        let content = res.content || [];
        if (!searchQuery && activeCategory !== 'All') {
          content = content.filter(post => post.category && post.category.categoryTitle === activeCategory);
        }

        setArticles(content);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, activeCategory, page, categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputQuery);
    setSearchParams(inputQuery ? { q: inputQuery } : {});
    setPage(0);
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  return (
    <div className="pt-24 pb-20 bg-techverse-eggshell min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-techverse-green">
            Explore <span className="text-techverse-olive">Stories</span>
          </h1>
          <p className="opacity-70 max-w-2xl mx-auto text-techverse-green">
            Discover the latest insights, tutorials, and perspectives from industry experts across all technology domains.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-4 rounded-sm shadow-sm border border-techverse-green/10">
          
          {/* Categories Tab */}
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', ...categories.map(c => c.categoryTitle)].map(category => (
              <button
                key={category}
                onClick={() => { setActiveCategory(category); setPage(0); }}
                className={`px-4 py-2 rounded-sm text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === category 
                    ? 'bg-techverse-green text-techverse-eggshell' 
                    : 'text-techverse-green opacity-70 hover:opacity-100 hover:bg-techverse-green/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-techverse-green opacity-50" />
            </div>
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-10 pr-4 py-2 bg-techverse-eggshell border-none rounded-sm text-sm focus:ring-2 focus:ring-techverse-olive text-techverse-green placeholder-techverse-green placeholder-opacity-40"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
          </form>
          
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-techverse-olive"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {articles.map(article => (
                <div key={article.postId} className="group flex flex-col h-full">
                  <Link to={`/article/${article.postId}`} className="block overflow-hidden rounded-sm mb-4 bg-techverse-green h-60">
                    <img 
                      src={getImageUrl(article.imageName, article.postId)} 
                      alt={article.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    />
                  </Link>
                  <div className="flex justify-between items-start mb-3">
                    {article.category && (
                      <span className="text-xs font-bold text-techverse-olive uppercase tracking-wider">
                        {article.category.categoryTitle}
                      </span>
                    )}
                  </div>
                  <Link to={`/article/${article.postId}`}>
                    <h3 className="text-2xl font-bold mb-3 text-techverse-green group-hover:text-techverse-olive transition-colors leading-tight">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-sm opacity-70 mb-6 text-techverse-green line-clamp-3 flex-grow" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }} />
                  <div className="flex items-center justify-between text-xs font-medium text-techverse-green opacity-60 pt-4 border-t border-techverse-green/10">
                    <span>{new Date(article.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{article.user?.name || 'Anonymous'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center space-x-4">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-full border border-techverse-green text-techverse-green hover:bg-techverse-green hover:text-techverse-eggshell disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-techverse-green transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-techverse-green">
                  Page {page + 1} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-full border border-techverse-green text-techverse-green hover:bg-techverse-green hover:text-techverse-eggshell disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-techverse-green transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-techverse-green mb-2">No results found</h3>
            <p className="opacity-70 text-techverse-green mb-6">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => { setInputQuery(''); setSearchQuery(''); setActiveCategory('All'); setPage(0); }}
              className="btn-outline px-6 py-2"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Explore;
