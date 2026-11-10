import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Clock, BookOpen, Heart, Bookmark,
  Share2, Sparkles, Users, Layers, Compass, CheckCircle2,
  PenTool, ShieldCheck, Cpu, Code2
} from 'lucide-react';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';

const LandingPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          postService.getAllPosts({ pageSize: 12, sortBy: 'addedDate', sortDirection: 'desc' }),
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

  const copyToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback below
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
      // non-critical share counter update failure
    }
  };

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const latestArticles = articles.length > 1 ? articles.slice(1, 7) : articles;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const getImageUrl = (post) => {
    if (!post) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    if (post.cloudinaryUrl) return post.cloudinaryUrl;
    if (post.media?.cloudinaryUrl) return post.media.cloudinaryUrl;
    if (post.imageName && post.imageName !== 'default.png') {
      return postService.getPostImage(post.postId);
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-techverse-eggshell">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-techverse-olive"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pt-24 pb-16 bg-techverse-eggshell"
    >
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-techverse-olive/20 text-techverse-green mb-4">
              The Tech Publication
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-techverse-green leading-[1.1] mb-6 tracking-tight">
              Discover Ideas. <br />
              <span className="text-techverse-olive">Share Knowledge.</span> <br />
              Explore Technology.
            </h1>
            <p className="text-base sm:text-lg text-techverse-green/80 mb-8 max-w-lg leading-relaxed">
              TechVerse is a modern blog platform for engineers, software developers, and technology enthusiasts to read, write, and discuss ideas shaping digital architecture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/explore" className="btn-primary">
                Explore Blogs <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link to="/dashboard/articles/new" className="btn-outline">
                Start Writing
              </Link>
            </div>
          </motion.div>

          {/* Featured Article Card */}
          {featuredArticle && (
            <motion.div variants={itemVariants} className="lg:col-span-7">
              <Link to={`/article/${featuredArticle.postId}`} className="block group">
                <div className="relative overflow-hidden rounded-3xl bg-techverse-green h-[420px] sm:h-[480px] shadow-lg">
                  <img
                    src={getImageUrl(featuredArticle)}
                    alt={featuredArticle.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
                    }}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-techverse-green via-techverse-green/40 to-transparent"></div>

                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-techverse-eggshell">
                    <div className="flex items-center gap-3 mb-3">
                      {featuredArticle.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-techverse-olive text-techverse-green">
                          {featuredArticle.category.categoryTitle}
                        </span>
                      )}
                      <span className="text-xs text-techverse-eggshell/70 flex items-center">
                        <Clock size={13} className="mr-1" />
                        {new Date(featuredArticle.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black leading-snug mb-3 group-hover:text-techverse-olive transition-colors line-clamp-2">
                      {featuredArticle.title}
                    </h2>

                    <div className="flex items-center justify-between pt-2 border-t border-techverse-eggshell/20 text-xs">
                      <span className="font-bold">{featuredArticle.user?.name || 'TechVerse Author'}</span>
                      <div className="flex items-center gap-4 text-techverse-eggshell/80">
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="fill-red-500 text-red-500" />
                          {featuredArticle.likeCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark size={14} />
                          {featuredArticle.bookmarkCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-techverse-green/10 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-techverse-green">Explore by Category</h2>
              <p className="text-xs sm:text-sm text-techverse-green/70 mt-1">Browse topics curated for modern technology stacks</p>
            </div>
            <Link to="/explore" className="text-xs sm:text-sm font-bold text-techverse-olive hover:text-techverse-green transition flex items-center">
              <span>View All Categories</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/category/${cat.categoryId}`}
                className="group p-5 bg-white rounded-2xl border border-techverse-green/10 hover:border-techverse-olive hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-techverse-olive/20 text-techverse-green flex items-center justify-center mb-3 group-hover:bg-techverse-green group-hover:text-techverse-eggshell transition-colors">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-techverse-green group-hover:text-techverse-olive transition truncate">
                    {cat.categoryTitle}
                  </h3>
                  <span className="text-[11px] text-techverse-green/60 mt-1 block">
                    Read posts →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Latest Published Articles Grid */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-techverse-green/10 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-techverse-green">Latest Published Blogs</h2>
              <p className="text-xs sm:text-sm text-techverse-green/70 mt-1">Fresh publications from our developer community</p>
            </div>
            <Link to="/explore" className="text-xs sm:text-sm font-bold text-techverse-olive hover:text-techverse-green transition flex items-center">
              <span>View All Posts</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <motion.div
                key={article.postId}
                variants={itemVariants}
                className="group bg-white rounded-2xl border border-techverse-green/10 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <Link to={`/article/${article.postId}`} className="block relative h-48 overflow-hidden bg-techverse-green">
                    <img
                      src={getImageUrl(article)}
                      alt={article.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      {(article.content || '').replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-techverse-eggshell/40 border-t border-techverse-green/5 flex items-center justify-between text-xs text-techverse-green/60">
                  <Link to={`/author/${article.user?.id}`} className="font-semibold text-techverse-green hover:underline">
                    {article.user?.name || 'Author'}
                  </Link>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart size={13} className="text-red-500 fill-red-500" />
                      {article.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark size={13} />
                      {article.bookmarkCount || 0}
                    </span>
                    <button
                      onClick={(e) => handleShare(e, article.postId)}
                      className="p-1 hover:text-techverse-green transition"
                      title="Share link"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Why TechVerse? Section */}
      <section id="why-techverse" className="bg-white py-20 mb-20 border-y border-techverse-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-techverse-olive">Our Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-black text-techverse-green mt-2 mb-4">
              Why Engineers Choose TechVerse
            </h2>
            <p className="text-sm text-techverse-green/70 leading-relaxed">
              A distraction-free publishing network built to help technologists document their solutions, share architecture patterns, and grow an audience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-techverse-eggshell/60 border border-techverse-green/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold">
                <Code2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-techverse-green">Share Technical Knowledge</h3>
              <p className="text-xs text-techverse-green/70 leading-relaxed">
                Publish long-form tutorials, code walkthroughs, and backend architecture breakdowns with full markdown support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-techverse-eggshell/60 border border-techverse-green/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold">
                <Cpu size={24} />
              </div>
              <h3 className="font-bold text-lg text-techverse-green">Discover Practical Solutions</h3>
              <p className="text-xs text-techverse-green/70 leading-relaxed">
                Read real-world production post-mortems, Spring Boot tips, React guides, and database tuning benchmarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-techverse-eggshell/60 border border-techverse-green/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-lg text-techverse-green">Learn from Other Developers</h3>
              <p className="text-xs text-techverse-green/70 leading-relaxed">
                Follow your favorite authors, participate in thoughtful comment responses, and bookmark stories to your private collection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-techverse-eggshell/60 border border-techverse-green/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-lg text-techverse-green">Build Developer Presence</h3>
              <p className="text-xs text-techverse-green/70 leading-relaxed">
                Establish an author profile showcasing your published articles, follower growth, and social channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-techverse-olive">Simple 3-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-black text-techverse-green mt-2 mb-4">
            How TechVerse Works
          </h2>
          <p className="text-sm text-techverse-green/70">
            From discovering ideas to publishing your own technical perspectives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-2xl bg-white border border-techverse-green/10 shadow-sm relative space-y-4">
            <span className="text-5xl font-black text-techverse-olive/30 block">01</span>
            <h3 className="text-xl font-bold text-techverse-green">Explore Blogs</h3>
            <p className="text-xs text-techverse-green/70 leading-relaxed">
              Browse by technology categories, search keywords, like interesting blogs, and save posts to your personal bookmarks.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-techverse-green/10 shadow-sm relative space-y-4">
            <span className="text-5xl font-black text-techverse-olive/30 block">02</span>
            <h3 className="text-xl font-bold text-techverse-green">Write Your Own Post</h3>
            <p className="text-xs text-techverse-green/70 leading-relaxed">
              Use our rich editor to write blog posts, upload media, save progress privately as drafts, and publish when ready.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-techverse-green/10 shadow-sm relative space-y-4">
            <span className="text-5xl font-black text-techverse-olive/30 block">03</span>
            <h3 className="text-xl font-bold text-techverse-green">Share Knowledge with Community</h3>
            <p className="text-xs text-techverse-green/70 leading-relaxed">
              One-click share links to social networks, track views and likes, and interact with readers in the comment sections.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call To Action (CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-techverse-green text-techverse-eggshell rounded-3xl p-10 sm:p-16 relative overflow-hidden text-center shadow-xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Ready to Share Your Engineering Journey?
            </h2>
            <p className="text-sm sm:text-base text-techverse-eggshell/80 leading-relaxed">
              Join thousands of software engineers and creators writing on TechVerse. Start with your first draft today.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/auth/register" className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-techverse-olive text-techverse-green hover:opacity-90 transition shadow-md">
                Create Free Account
              </Link>
              <Link to="/explore" className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold border border-techverse-eggshell/30 text-techverse-eggshell hover:bg-white/10 transition">
                Browse Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
