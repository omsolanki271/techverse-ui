import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  Clock, Bookmark, Heart, MessageCircle, 
  Trash2, Edit3, LogIn
} from 'lucide-react';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100, damping: 30, restDelta: 0.001
  });

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getPostById(id),
          commentService.getCommentsByPost(id)
        ]);
        setArticle(postData);
        setComments(commentsData || []);
      } catch (error) {
        toast.error('Article not found or failed to load.');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    fetchArticleAndComments();
  }, [id, navigate, toast]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (commentText.length < 2 || commentText.length > 1000) {
      toast.error('Comment must be between 2 and 1000 characters');
      return;
    }

    setSubmittingComment(true);
    try {
      // Assuming userId is available in user object
      const userId = user.id || user.userId || user.id; // Adjust based on actual backend user ID field
      // If user ID is not in context but JWT is used, backend might not need userId in path. 
      // But prompt says: POST /api/comments/user/{userId}/post/{postId}
      // Let's assume user.userId exists. If it doesn't, we'd need to fetch user profile on login and store it.
      // We will assume user.userId for now.
      const newComment = await commentService.createComment(user.userId || user.id, id, { content: commentText });
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId && c.commentId !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment. You may not have permission.');
    }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000';
    }
    return postService.getPostImage(postId);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-techverse-eggshell">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-techverse-olive"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <article className="bg-techverse-eggshell min-h-screen pt-24 pb-20">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-techverse-olive z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm opacity-60 mb-8 font-medium">
          <Link to="/" className="hover:text-techverse-olive transition-colors">Home</Link>
          <span className="mx-2">/</span>
          {article.category && (
            <Link to={`/category/${article.category.categoryId}`} className="hover:text-techverse-olive transition-colors uppercase">
              {article.category.categoryTitle}
            </Link>
          )}
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 text-techverse-green">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between py-6 border-y border-techverse-green/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-techverse-olive bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold text-lg">
                {(article.user?.name || 'A').charAt(0)}
              </div>
              <div>
                <span className="font-bold text-techverse-green block">
                  {article.user?.name || 'Anonymous'}
                </span>
                <div className="text-sm opacity-60 flex items-center">
                  <span>{new Date(article.addedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            {(isAdmin() || (user && user.username === article.user?.username)) && (
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link to={`/dashboard/articles/${article.postId}/edit`} className="p-2 text-techverse-olive hover:bg-techverse-green/5 rounded-full transition-colors" title="Edit Post">
                  <Edit3 size={20} />
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-16">
          <div className="rounded-sm overflow-hidden bg-techverse-green h-[400px] md:h-[500px]">
            <img src={getImageUrl(article.imageName, article.postId)} alt="Article cover" className="w-full h-full object-cover" />
          </div>
        </figure>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div 
              className="prose prose-lg prose-techverse max-w-none text-techverse-green"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
          
          {/* Sidebar / Info */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-32 p-6 bg-white/40 border border-techverse-green/10 rounded-sm">
              <h4 className="font-bold uppercase tracking-wider text-sm opacity-60 mb-4">About the Author</h4>
              <p className="text-sm font-medium text-techverse-green mb-2">{article.user?.name || 'Anonymous'}</p>
              <p className="text-sm opacity-70 mb-4">{article.user?.about || 'Technology enthusiast and writer.'}</p>
            </div>
          </div>
          
        </div>
        
        {/* Comments Section */}
        <section className="mt-20 border-t border-techverse-green/10 pt-12">
          <h3 className="text-2xl font-bold mb-8 flex items-center text-techverse-green">
            <MessageCircle className="mr-3 text-techverse-olive" /> Responses ({comments.length})
          </h3>
          
          {user ? (
            <div className="p-6 border border-techverse-green/20 rounded-sm mb-12 bg-white/40">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts?" 
                className="w-full bg-transparent border-none focus:ring-0 resize-none h-24 mb-4 text-techverse-green placeholder-techverse-green placeholder-opacity-40"
              ></textarea>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${commentText.length > 1000 ? 'text-red-500' : 'opacity-50'}`}>
                  {commentText.length}/1000
                </span>
                <button 
                  onClick={handleCommentSubmit}
                  disabled={submittingComment || !commentText.trim() || commentText.length < 2 || commentText.length > 1000}
                  className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Respond'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-techverse-green/20 rounded-sm mb-12 bg-white/40 text-center">
              <MessageCircle size={32} className="mx-auto mb-4 text-techverse-olive opacity-50" />
              <p className="text-techverse-green mb-4">You must be logged in to leave a response.</p>
              <Link to="/auth/login" className="btn-outline px-6 py-2 inline-flex items-center">
                <LogIn size={16} className="mr-2" /> Sign In
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id || comment.commentId} className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold text-sm shrink-0">
                    {(comment.user?.name || 'A').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/60 border border-techverse-green/10 rounded-sm p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-techverse-green">{comment.user?.name || 'Anonymous'}</span>
                        
                        {(isAdmin() || (user && user.username === comment.user?.username)) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id || comment.commentId)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-techverse-green text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center opacity-60 text-techverse-green py-8">No responses yet. Be the first!</p>
            )}
          </div>
        </section>

      </div>
    </article>
  );
};

export default ArticleDetails;
