import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Bookmark, Heart, Share2, Clock, User } from 'lucide-react';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryId: paramCatId } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [inputQuery, setInputQuery] = useState(searchParams.get('q') || '');
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const toast = useToast();

  // Sync with URL query parameter changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
    setInputQuery(q);
  }, [searchParams]);

  // Fetch Categories once and match paramCatId
  useEffect(() => {
    categoryService.getAllCategories().then((cats) => {
      const list = cats || [];
      setCategories(list);
      if (paramCatId && list.length > 0) {
        const found = list.find(c => String(c.categoryId) === String(paramCatId));
        if (found) {
          setActiveCategory(found.categoryTitle);
        }
      } else if (!paramCatId) {
        setActiveCategory('All');
      }
    }).catch(console.error);
  }, [paramCatId]);

  // Fetch Posts based on filters
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let content = [];
        let total = 1;
        const size = 9;
        
        const cat = activeCategory !== 'All' ? categories.find(c => c.categoryTitle === activeCategory) : null;
        const categoryId = cat ? cat.categoryId : (paramCatId ? Number(paramCatId) : null);

        if (searchQuery.trim()) {
          const params = categoryId ? { categoryId } : {};
          const res = await postService.searchPosts(searchQuery.trim(), params);
          content = Array.isArray(res) ? res : (res?.content || []);
          total = 1;
        } else if (categoryId) {
          const res = await postService.getPostsByCategory(categoryId, { pageNumber: page, pageSize: size, sortBy: 'addedDate', sortDirection: 'desc' });
          content = res?.content || [];
          total = res?.totalPages || 1;
        } else {
          const res = await postService.getAllPosts({ pageNumber: page, pageSize: size, sortBy: 'addedDate', sortDirection: 'desc' });
          content = res?.content || [];
          total = res?.totalPages || 1;
        }

        setArticles(content);
        setTotalPages(total);
      } catch (err) {
        console.error('Failed to fetch posts', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory, searchQuery, page, categories, paramCatId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    setSearchQuery(trimmed);
    setPage(0);
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (catTitle, catId) => {
    setActiveCategory(catTitle);
    setPage(0);
    if (paramCatId) {
      navigate('/explore');
    }
  };

  const handleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }
    try {
      const res = await postService.toggleLike(postId);
      setArticles(articles.map(a => a.postId === postId ? { ...a, liked: res.liked, likeCount: res.likeCount } : a));
      if (res.liked) toast.success('Liked post!');
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleBookmark = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to bookmark posts');
      return;
    }
    try {
      const res = await postService.toggleBookmark(postId);
      setArticles(articles.map(a => a.postId === postId ? { ...a, bookmarked: res.bookmarked, bookmarkCount: res.bookmarkCount } : a));
      toast.success(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const copyToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (e) {
      return false;
    }
  };

  const handleShare = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/article/${postId}`;
    const copied = await copyToClipboard(url);
    if (copied) {
      toast.success('Post link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
    try {
      await postService.incrementShare(postId);
    } catch {
      // Non-critical share counter update failure ignored
    }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  return (
    <div className="pt-28 pb-20 bg-techverse-eggshell min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-black text-techverse-green tracking-tight">Explore Blogs</h1>
          <p className="text-sm sm:text-base text-techverse-green/70 mt-2">
            Curated ideas, insights, and engineering stories across technology domains.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          
          {/* Categories Pill list */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => handleCategorySelect('All', null)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                activeCategory === 'All'
                  ? 'bg-techverse-green text-techverse-eggshell'
                  : 'bg-white text-techverse-green/70 hover:text-techverse-green hover:bg-white/80 border border-techverse-green/10'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => handleCategorySelect(cat.categoryTitle, cat.categoryId)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  activeCategory === cat.categoryTitle
                    ? 'bg-techverse-green text-techverse-eggshell'
                    : 'bg-white text-techverse-green/70 hover:text-techverse-green hover:bg-white/80 border border-techverse-green/10'
                }`}
              >
                {cat.categoryTitle}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-techverse-green/40" size={16} />
            <input 
              type="text" 
              placeholder="Search blogs..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-techverse-green/15 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-techverse-olive text-techverse-green placeholder-techverse-green/40 shadow-sm"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <div key={article.postId} className="group bg-white rounded-2xl border border-techverse-green/10 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div>
                    <Link to={`/article/${article.postId}`} className="block relative h-52 overflow-hidden bg-techverse-green">
                      <img 
                        src={getImageUrl(article.imageName, article.postId)} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      {article.category && (
                        <span className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {article.category.categoryTitle}
                        </span>
                      )}
                    </Link>

                    <div className="p-6">
                      <Link to={`/article/${article.postId}`}>
                        <h3 className="text-xl font-bold text-techverse-green group-hover:text-techverse-olive transition-colors line-clamp-2 mb-2 leading-snug">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-techverse-green/70 line-clamp-3 leading-relaxed mb-4">
                        {(article.content || '').replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-techverse-eggshell/40 border-t border-techverse-green/5 flex items-center justify-between text-xs text-techverse-green/60">
                    <Link to={`/author/${article.user?.id}`} className="font-semibold text-techverse-green hover:underline truncate max-w-[120px]">
                      {article.user?.name || 'Author'}
                    </Link>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleLike(e, article.postId)}
                        className={`flex items-center gap-1 transition ${article.liked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                        title="Like"
                      >
                        <Heart size={14} className={article.liked ? 'fill-red-500 text-red-500' : ''} />
                        <span>{article.likeCount || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleBookmark(e, article.postId)}
                        className={`flex items-center gap-1 transition ${article.bookmarked ? 'text-techverse-olive font-bold' : 'hover:text-techverse-olive'}`}
                        title="Bookmark"
                      >
                        <Bookmark size={14} className={article.bookmarked ? 'fill-techverse-olive text-techverse-olive' : ''} />
                        <span>{article.bookmarkCount || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(e, article.postId)}
                        className="p-1 hover:text-techverse-green transition"
                        title="Share link"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
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
                  className="p-2 rounded-xl border border-techverse-green text-techverse-green hover:bg-techverse-green hover:text-techverse-eggshell disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-techverse-green transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs sm:text-sm font-bold text-techverse-green">
                  Page {page + 1} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-xl border border-techverse-green text-techverse-green hover:bg-techverse-green hover:text-techverse-eggshell disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-techverse-green transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-techverse-green/10 p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-techverse-green mb-2">No blogs found</h3>
            <p className="text-xs sm:text-sm text-techverse-green/60 mb-6">Try adjusting your search keywords or topic filter.</p>
            <button 
              onClick={() => { setInputQuery(''); setSearchQuery(''); setActiveCategory('All'); setPage(0); setSearchParams({}); if (paramCatId) navigate('/explore'); }}
              className="btn-primary text-xs px-5 py-2.5 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
