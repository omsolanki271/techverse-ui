import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, Globe, BookOpen, Clock,
  ArrowLeft, RefreshCw, CheckCircle2, ArrowRight
} from 'lucide-react';
import userService from '../../services/userService';
import postService from '../../services/postService';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const AuthorProfile = () => {
  const { userId } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        // Fetch author details and posts concurrently
        const [userData, postsData] = await Promise.allSettled([
          userService.getUserById(userId),
          postService.getPostsByUser(userId)
        ]);

        if (userData.status === 'fulfilled') {
          setAuthor(userData.value);
        } else {
          console.error('Failed to load author info:', userData.reason);
        }

        if (postsData.status === 'fulfilled') {
          const fetchedPosts = postsData.value?.content || (Array.isArray(postsData.value) ? postsData.value : []);
          setPosts(fetchedPosts);

          // Fallback author info from first post if getUserById failed or restricted
          if (userData.status !== 'fulfilled' && fetchedPosts.length > 0 && fetchedPosts[0].user) {
            setAuthor(fetchedPosts[0].user);
          }
        }
      } catch (error) {
        console.error('Error loading author profile page:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAuthorData();
    }
  }, [userId]);

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-techverse-eggshell">
        <div className="flex flex-col items-center space-y-4 text-techverse-green">
          <RefreshCw className="animate-spin text-techverse-olive" size={36} />
          <p className="font-semibold text-lg">Loading Author Profile...</p>
        </div>
      </div>
    );
  }

  const roleName = author?.roles?.[0]?.name || author?.roles?.[0] || 'ROLE_USER';

  return (
    <div className="pt-24 pb-20 bg-techverse-eggshell min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Back Link */}
        <div>
          <Link to="/" className="inline-flex items-center text-sm font-bold text-techverse-green hover:text-techverse-olive transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Link>
        </div>

        {/* Author Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-md border border-techverse-green/10 overflow-hidden"
        >
          {/* Header Backdrop */}
          <div className="h-44 bg-gradient-to-r from-techverse-green via-techverse-green/90 to-techverse-olive/80 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          {/* Profile Header Content */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-techverse-green text-techverse-eggshell flex items-center justify-center font-black text-4xl shadow-xl">
                  {author?.name?.charAt(0)?.toUpperCase() || author?.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-techverse-olive border-2 border-white flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-techverse-green" />
                </div>
              </div>

              {/* Author Info */}
              <div className="pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-3xl font-black text-techverse-eggshell">{author?.name || author?.username || `Author #${userId}`}</h1>
                  {/* <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-techverse-olive/30 text-techverse-green border border-techverse-olive/40">
                    {roleName.replace('ROLE_', '')}
                  </span> */}
                </div>

                {author?.about && (
                  <p className="text-sm text-techverse-green/80 mt-2 max-w-xl line-clamp-2 leading-relaxed">
                    {author.about}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-techverse-green/70">
                  {author?.email && (
                    <span className="flex items-center">
                      <Mail size={14} className="mr-1.5 opacity-70" />
                      {author.email}
                    </span>
                  )}
                  {author?.address && (
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1.5 opacity-70" />
                      {author.address}
                    </span>
                  )}
                </div>

                {/* Social Profiles */}
                <div className="flex items-center justify-center sm:justify-start space-x-3 mt-4">
                  {author?.githubUrl && (
                    <a href={author.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-techverse-green/5 text-techverse-green hover:bg-techverse-olive hover:text-techverse-green transition-colors" title="GitHub">
                      <GithubIcon size={18} />
                    </a>
                  )}
                  {author?.linkedinUrl && (
                    <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="LinkedIn">
                      <LinkedinIcon size={18} />
                    </a>
                  )}
                  {author?.instaUrl && (
                    <a href={author.instaUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors" title="Instagram">
                      <InstagramIcon size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Author Stat Pill */}
            <div className="flex items-center justify-center space-x-6 bg-techverse-eggshell/60 border border-techverse-green/10 px-6 py-3.5 rounded-xl self-center sm:self-end shadow-sm">
              <div className="text-center">
                <span className="block text-2xl font-black text-techverse-green">{posts.length}</span>
                <span className="text-xs text-techverse-green/70 font-bold uppercase">Articles Published</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Authored Articles Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-techverse-green/10 pb-4">
            <h2 className="text-2xl font-black text-techverse-green flex items-center">
              <BookOpen size={24} className="mr-3 text-techverse-olive" />
              Articles Authored by {author?.name?.split(' ')[0] || 'Author'}
            </h2>
            <span className="text-xs font-bold text-techverse-green/60 uppercase tracking-wider">
              {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((article) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={article.postId || article.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-techverse-green/10 overflow-hidden flex flex-col transition-all duration-300"
                >
                  <div className="overflow-hidden h-52 bg-techverse-green relative">
                    <img
                      src={getImageUrl(article.imageName, article.postId || article.id)}
                      alt={article.title || article.postTitle}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    />
                    {article.category && (
                      <span className="absolute top-4 left-4 bg-techverse-green text-techverse-eggshell text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-sm">
                        {article.category.categoryTitle}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <Link to={`/article/${article.postId || article.id}`}>
                        <h3 className="text-xl font-bold mb-3 text-techverse-green group-hover:text-techverse-olive transition-colors leading-tight">
                          {article.title || article.postTitle}
                        </h3>
                      </Link>
                      <p className="text-xs text-techverse-green/70 line-clamp-3 mb-4 leading-relaxed">
                        {article.content?.replace(/<[^>]*>?/gm, '').substring(0, 140)}...
                      </p>
                    </div>

                    <div className="pt-4 border-t border-techverse-green/10 flex items-center justify-between text-xs text-techverse-green/60 font-medium">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1 opacity-70" />
                        {new Date(article.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <Link
                        to={`/article/${article.postId || article.id}`}
                        className="font-bold text-techverse-olive hover:underline flex items-center"
                      >
                        Read Article <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-techverse-green/10 shadow-sm max-w-xl mx-auto">
              <BookOpen size={48} className="mx-auto mb-4 text-techverse-green/30" />
              <h3 className="text-xl font-extrabold text-techverse-green mb-2">No Published Articles Yet</h3>
              <p className="text-xs text-techverse-green/70 mb-6">This author hasn't published any public articles on TechVerse yet.</p>
              <Link to="/explore" className="btn-primary text-xs px-6 py-2.5">
                Explore Other Articles
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default AuthorProfile;
