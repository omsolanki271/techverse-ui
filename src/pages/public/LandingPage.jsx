import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, BookOpen } from 'lucide-react';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';

const LandingPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          postService.getAllPosts({ pageSize: 10, sortBy: 'addedDate', sortDirection: 'desc' }),
          categoryService.getAllCategories()
        ]);
        setArticles(postsRes.content || []);
        setCategories(catsRes || []);
      } catch (error) {
        console.error('Failed to load landing page data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const trendingArticles = articles.length > 1 ? articles.slice(1, 3) : [];
  const latestArticles = articles.length > 0 ? articles : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'; // Premium placeholder if default
    }
    return postService.getPostImage(postId);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-techverse-olive"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pt-24 pb-16"
    >
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Ideas shaping the <br/>
              <span className="text-techverse-olive">technology of tomorrow.</span>
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-lg leading-relaxed">
              Discover premium long-form articles, insights, and perspectives from industry leaders in AI, engineering, and digital architecture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/explore" className="btn-primary">
                Explore Stories <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link to="/dashboard/articles/new" className="btn-outline">
                Start Writing
              </Link>
            </div>
          </motion.div>

          {/* Featured Article Card (Asymmetric) */}
          {featuredArticle && (
            <motion.div variants={itemVariants} className="lg:col-span-7">
              <Link to={`/article/${featuredArticle.postId}`} className="block group">
                <div className="relative overflow-hidden rounded-sm bg-techverse-green h-[500px]">
                  <img 
                    src={getImageUrl(featuredArticle.imageName, featuredArticle.postId)} 
                    alt={featuredArticle.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-techverse-green via-techverse-green/40 to-transparent opacity-90"></div>
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full text-techverse-eggshell">
                    <div className="flex items-center space-x-3 mb-4">
                      {featuredArticle.category && (
                        <span className="bg-techverse-olive text-techverse-green text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
                          {featuredArticle.category.categoryTitle}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-techverse-olive transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-sm opacity-80 line-clamp-2 max-w-2xl" dangerouslySetInnerHTML={{ __html: featuredArticle.content.substring(0, 150) + '...' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
          
        </div>
      </section>

      {/* Trending Section (Mocked logic using top 2 of current page for visual) */}
      {trendingArticles.length > 0 && (
        <section className="bg-techverse-green text-techverse-eggshell py-20 mb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-12 border-b border-techverse-olive/30 pb-6">
              <h2 className="text-3xl font-black flex items-center">
                <TrendingUp className="mr-3 text-techverse-olive" size={28} />
                Trending Now
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trendingArticles.map((article, index) => (
                <motion.div variants={itemVariants} key={article.postId} className="flex gap-6 group">
                  <span className="text-6xl font-black text-techverse-olive opacity-20 group-hover:opacity-100 transition-opacity">
                    0{index + 1}
                  </span>
                  <div>
                    {article.category && (
                      <Link to={`/category/${article.category.categoryId}`} className="text-xs font-bold text-techverse-olive uppercase tracking-wider mb-2 block">
                        {article.category.categoryTitle}
                      </Link>
                    )}
                    <Link to={`/article/${article.postId}`}>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-techverse-olive transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="text-xs opacity-60 mt-4">
                      {new Date(article.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-12 border-b border-techverse-green/10 pb-6">
            <h2 className="text-3xl font-black">Latest from TechVerse</h2>
            <Link to="/explore" className="text-techverse-olive font-bold hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <motion.div variants={itemVariants} key={article.postId} className="group cursor-pointer">
                <div className="overflow-hidden rounded-sm mb-4 h-56 bg-techverse-green relative">
                  <img 
                    src={getImageUrl(article.imageName, article.postId)} 
                    alt={article.title} 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between items-start mb-2">
                  {article.category && (
                    <span className="text-xs font-bold text-techverse-olive uppercase tracking-wider">
                      {article.category.categoryTitle}
                    </span>
                  )}
                </div>
                <Link to={`/article/${article.postId}`}>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-techverse-olive transition-colors leading-tight">
                    {article.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between text-xs opacity-80 font-medium mt-4 pt-3 border-t border-techverse-green/10">
                  <span>{new Date(article.addedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  {article.user && (
                    <Link to={`/author/${article.user.id}`} className="font-bold text-techverse-green hover:text-techverse-olive transition-colors flex items-center">
                      <span className="w-5 h-5 rounded-full bg-techverse-green text-techverse-eggshell text-[10px] flex items-center justify-center mr-1.5 font-black">
                        {article.user.name?.charAt(0) || 'A'}
                      </span>
                      {article.user.name || 'Author'}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Bloggers / Author Profiles Section */}
      {(() => {
        const authorsMap = new Map();
        articles.forEach(art => {
          if (art.user && art.user.id) {
            const u = art.user;
            if (!authorsMap.has(u.id)) {
              authorsMap.set(u.id, {
                id: u.id,
                name: u.name || 'TechVerse Blogger',
                email: u.email || '',
                about: u.about || 'Active contributor and tech writer sharing perspectives on TechVerse.',
                postCount: 1
              });
            } else {
              authorsMap.get(u.id).postCount += 1;
            }
          }
        });
        const bloggersList = Array.from(authorsMap.values());

        if (bloggersList.length === 0) return null;

        return (
          <section className="bg-techverse-green text-techverse-eggshell py-20 mb-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 border-b border-techverse-olive/30 pb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-black flex items-center text-techverse-eggshell">
                    Featured Bloggers & Authors
                  </h2>
                  <p className="text-xs text-techverse-eggshell/70 mt-1">
                    Click any blogger profile to read all articles authored by them.
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bloggersList.map((blogger) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={blogger.id} 
                    className="bg-white/5 border border-techverse-olive/20 rounded-xl p-6 hover:bg-white/10 hover:border-techverse-olive/50 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                          {blogger.name?.charAt(0)?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-techverse-eggshell group-hover:text-techverse-olive transition-colors">
                            {blogger.name}
                          </h3>
                          <span className="inline-block text-[11px] font-extrabold uppercase bg-techverse-olive/20 text-techverse-olive px-2.5 py-0.5 rounded-full mt-0.5">
                            {blogger.postCount} {blogger.postCount === 1 ? 'Article' : 'Articles'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-techverse-eggshell/70 line-clamp-3 mb-6 leading-relaxed">
                        {blogger.about}
                      </p>
                    </div>

                    <Link 
                      to={`/author/${blogger.id}`}
                      className="w-full py-2.5 px-4 bg-techverse-olive text-techverse-green rounded-lg font-bold text-xs flex items-center justify-center hover:bg-techverse-olive/90 transition-colors shadow-sm"
                    >
                      View All Posts by {blogger.name.split(' ')[0]} <ArrowRight size={14} className="ml-2" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Explore Categories */}
      {categories.length > 0 && (
        <section className="bg-techverse-green/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-black mb-4">Explore Categories</h2>
              <p className="opacity-70 max-w-2xl mx-auto">Dive deep into specific technology domains curated by our editorial team.</p>
            </motion.div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <motion.div variants={itemVariants} key={category.categoryId}>
                  <Link 
                    to={`/category/${category.categoryId}`}
                    className="inline-block px-6 py-3 bg-techverse-eggshell border border-techverse-green/20 rounded-sm font-medium hover:bg-techverse-green hover:text-techverse-eggshell transition-all shadow-sm"
                  >
                    {category.categoryTitle}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default LandingPage;
