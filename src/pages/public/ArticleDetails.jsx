import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  Clock, Bookmark, Heart, MessageCircle, 
  Trash2, Edit3, LogIn, Share2, Eye,
  UserPlus, UserCheck, Bell, BellOff, ArrowLeft, Check
} from 'lucide-react';
import postService from '../../services/postService';
import userService from '../../services/userService';
import commentService from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Engagement state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Author follow / subscribe state
  const [authorFollowed, setAuthorFollowed] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [authorSubscribed, setAuthorSubscribed] = useState(false);
  const [followingAction, setFollowingAction] = useState(false);
  const [subAction, setSubAction] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100, damping: 30, restDelta: 0.001
  });

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getPostById(id),
          commentService.getCommentsByPost(id).catch(() => [])
        ]);
        setArticle(postData);
        setComments(commentsData || []);

        setLiked(postData.liked || false);
        setLikeCount(postData.likeCount || 0);
        setBookmarked(postData.bookmarked || false);
        setBookmarkCount(postData.bookmarkCount || 0);
        setShareCount(postData.shareCount || 0);

        if (postData.user?.id) {
          try {
            const authorStatus = await userService.getFollowStatus(postData.user.id);
            setAuthorFollowed(authorStatus.following || false);
            setFollowerCount(authorStatus.followerCount || 0);

            if (user) {
              const subStatus = await userService.getSubscribeStatus(postData.user.id);
              setAuthorSubscribed(subStatus.subscribed || false);
            }
          } catch (e) {
            // Unauthenticated or author lookup error
          }
        }
      } catch (error) {
        toast.error('Article not found or failed to load.');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    fetchArticleAndComments();
  }, [id, user, navigate, toast]);

  const requireAuth = (actionName) => {
    if (!user) {
      toast.error(`Please log in to ${actionName}.`);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth('like this post')) return;
    try {
      const res = await postService.toggleLike(id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
      if (res.liked) {
        toast.success('Liked article!');
      }
    } catch {
      toast.error('Failed to update like status');
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth('bookmark this post')) return;
    try {
      const res = await postService.toggleBookmark(id);
      setBookmarked(res.bookmarked);
      setBookmarkCount(res.bookmarkCount);
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

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const copied = await copyToClipboard(currentUrl);
    if (copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Post link copied to clipboard!');
    } else {
      toast.error('Failed to copy link to clipboard');
    }

    try {
      const res = await postService.incrementShare(id);
      if (res && res.shareCount !== undefined) {
        setShareCount(res.shareCount);
      }
    } catch {
      // Non-critical share counter update failure
    }
  };

  const handleFollowToggle = async () => {
    if (!requireAuth('follow this author')) return;
    if (!article?.user?.id) return;
    setFollowingAction(true);
    try {
      const res = await userService.toggleFollow(article.user.id);
      setAuthorFollowed(res.following);
      setFollowerCount(res.followerCount);
      toast.success(res.following ? `Following ${article.user.name}` : `Unfollowed ${article.user.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowingAction(false);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!requireAuth('subscribe to this author')) return;
    if (!article?.user?.id) return;
    setSubAction(true);
    try {
      const res = await userService.toggleSubscribe(article.user.id);
      setAuthorSubscribed(res.subscribed);
      toast.success(res.subscribed ? `Subscribed to ${article.user.name}'s publications!` : `Unsubscribed from ${article.user.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSubAction(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (commentText.length < 2 || commentText.length > 1000) {
      toast.error('Comment must be between 2 and 1000 characters');
      return;
    }

    setSubmittingComment(true);
    try {
      const newComment = await commentService.createComment(id, { content: commentText.trim() });
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null) || 'Failed to post comment.';
      toast.error(msg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!(await confirm('Delete this comment?'))) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c.commentId !== commentId));
      toast.success('Comment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const getImageUrl = (imageName, postId) => {
    if (!imageName || imageName === 'default.png') {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200';
    }
    return postService.getPostImage(postId);
  };

  const isOwner = user && article?.user && (user.id === article.user.id || user.userId === article.user.id || user.email === article.user.email);

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-techverse-olive"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <>
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-techverse-olive z-50 origin-left"
        style={{ scaleX }}
      />

      <article className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-techverse-green/60">
          <Link to="/" className="hover:text-techverse-olive transition">Home</Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-techverse-olive transition">Explore Blogs</Link>
          {article.category && (
            <>
              <span>/</span>
              <Link to={`/category/${article.category.categoryId}`} className="text-techverse-olive hover:underline">
                {article.category.categoryTitle}
              </Link>
            </>
          )}
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 text-techverse-green">
            {article.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-techverse-green/10">
            {/* Author info */}
            <div className="flex items-center space-x-4">
              <Link to={`/author/${article.user?.id}`}>
                <div className="w-12 h-12 rounded-full border border-techverse-olive bg-techverse-green text-techverse-eggshell flex items-center justify-center font-bold text-lg hover:scale-105 transition-transform">
                  {(article.user?.name || 'A').charAt(0)}
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <Link to={`/author/${article.user?.id}`} className="font-bold text-techverse-green hover:text-techverse-olive transition">
                    {article.user?.name || 'Anonymous Author'}
                  </Link>
                  {!isOwner && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followingAction}
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition ${
                        authorFollowed
                          ? 'bg-techverse-eggshell text-techverse-green border border-techverse-green/20 hover:bg-red-50 hover:text-red-600'
                          : 'bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90'
                      }`}
                    >
                      {authorFollowed ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>
                <div className="text-xs text-techverse-green/60 flex items-center gap-3 mt-1">
                  <span>{new Date(article.addedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
                </div>
              </div>
            </div>
            
            {/* Post actions / owner edit */}
            <div className="flex items-center space-x-3">
              {(isAdmin() || isOwner) && (
                <Link to={`/dashboard/articles/${article.postId}/edit`} className="p-2 text-techverse-olive hover:bg-techverse-green/5 rounded-full transition-colors" title="Edit Post">
                  <Edit3 size={18} />
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-12">
          <div className="rounded-2xl overflow-hidden bg-techverse-green h-[350px] md:h-[480px] shadow-sm">
            <img src={getImageUrl(article.imageName, article.postId)} alt={article.title} className="w-full h-full object-cover" />
          </div>
        </figure>

        {/* Floating / Sticky Interactive Action Bar */}
        <div className="sticky top-24 z-20 my-6 bg-white/90 backdrop-blur-md py-3 px-5 rounded-2xl border border-techverse-green/10 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-bold transition group ${liked ? 'text-red-500' : 'text-techverse-green/70 hover:text-red-500'}`}
              title="Like this article"
            >
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'group-hover:scale-110 transition-transform'} />
              <span>{likeCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-sm font-bold transition group ${bookmarked ? 'text-techverse-olive' : 'text-techverse-green/70 hover:text-techverse-olive'}`}
              title="Save to bookmarks"
            >
              <Bookmark size={20} className={bookmarked ? 'fill-techverse-olive text-techverse-olive' : 'group-hover:scale-110 transition-transform'} />
              <span>{bookmarkCount}</span>
            </button>

            {/* Comments Counter */}
            <a
              href="#comments"
              className="flex items-center gap-1.5 text-sm font-bold text-techverse-green/70 hover:text-techverse-green transition"
              title="Jump to responses"
            >
              <MessageCircle size={20} />
              <span>{comments.length}</span>
            </a>

            {/* Views counter */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-techverse-green/60 border-l border-techverse-green/10 pl-5">
              <Eye size={16} />
              <span>{article.views || 0} views</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-techverse-green/15 text-techverse-green hover:bg-techverse-eggshell transition shadow-sm"
              title="Copy link to article"
            >
              {copied ? <Check size={15} className="text-green-600" /> : <Share2 size={15} />}
              <span>{copied ? 'Copied!' : `Share (${shareCount})`}</span>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10 mt-8">
          
          {/* Main Article Text */}
          <div className="lg:w-3/4">
            <div 
              className="prose prose-lg prose-techverse max-w-none text-techverse-green leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
          
          {/* Author Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-40 p-6 bg-white rounded-2xl border border-techverse-green/10 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-techverse-olive text-techverse-green flex items-center justify-center font-bold text-lg">
                  {(article.user?.name || 'A').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-techverse-green">{article.user?.name || 'Anonymous'}</h4>
                  <span className="text-[11px] text-techverse-green/60">{followerCount} followers</span>
                </div>
              </div>

              <p className="text-xs text-techverse-green/70 leading-relaxed">
                {article.user?.about || 'Writer and contributor on TechVerse.'}
              </p>

              <div className="space-y-2 pt-2 border-t border-techverse-green/10">
                {!isOwner && (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followingAction}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                        authorFollowed
                          ? 'bg-techverse-eggshell text-techverse-green border border-techverse-green/20 hover:bg-red-50 hover:text-red-600'
                          : 'bg-techverse-green text-techverse-eggshell hover:bg-techverse-green/90'
                      }`}
                    >
                      {authorFollowed ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      <span>{authorFollowed ? 'Following' : 'Follow Author'}</span>
                    </button>

                    <button
                      onClick={handleSubscribeToggle}
                      disabled={subAction}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition border ${
                        authorSubscribed
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-techverse-green border-techverse-green/20 hover:bg-techverse-eggshell'
                      }`}
                    >
                      {authorSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
                      <span>{authorSubscribed ? 'Subscribed' : 'Subscribe for Updates'}</span>
                    </button>
                  </>
                )}

                <Link
                  to={`/author/${article.user?.id}`}
                  className="block text-center text-xs font-semibold text-techverse-olive hover:underline pt-1"
                >
                  View Full Author Profile →
                </Link>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Comments Section */}
        <section id="comments" className="mt-20 border-t border-techverse-green/10 pt-12">
          <h3 className="text-2xl font-bold mb-8 flex items-center text-techverse-green">
            <MessageCircle className="mr-3 text-techverse-olive" /> Responses ({comments.length})
          </h3>
          
          {user ? (
            <div className="p-6 border border-techverse-green/20 rounded-2xl mb-12 bg-white shadow-sm">
              <textarea 
                className="w-full bg-transparent border-0 p-0 text-techverse-green placeholder-techverse-green/40 focus:ring-0 resize-none h-28 text-sm"
                placeholder="Share your thoughts on this story..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-between items-center pt-4 border-t border-techverse-green/10">
                <span className="text-xs text-techverse-green/50">{commentText.length}/1000 characters</span>
                <button 
                  onClick={handleCommentSubmit}
                  disabled={submittingComment || !commentText.trim()}
                  className="btn-primary py-2 px-5 text-xs rounded-lg disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Respond'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-techverse-green/15 rounded-2xl mb-12 bg-white text-center shadow-sm">
              <p className="font-bold text-techverse-green mb-2">Join the conversation</p>
              <p className="text-xs text-techverse-green/60 mb-5">Sign in to leave a response or interact with this article.</p>
              <Link to="/auth/login" className="btn-primary inline-flex items-center text-xs px-5 py-2.5 rounded-lg">
                <LogIn size={14} className="mr-2" /> Log In to Comment
              </Link>
            </div>
          )}

          {/* Comment Stream */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.commentId} className="p-5 bg-white border border-techverse-green/10 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-techverse-olive/30 text-techverse-green flex items-center justify-center font-bold text-xs">
                      {(comment.user?.name || 'U').charAt(0)}
                    </div>
                    <span className="font-bold text-xs text-techverse-green">{comment.user?.name || 'Community Member'}</span>
                  </div>
                  {(isAdmin() || (user && comment.user && (user.id === comment.user.id || user.userId === comment.user.id))) && (
                    <button 
                      onClick={() => handleDeleteComment(comment.commentId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-techverse-green/80 leading-relaxed pl-11">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
};

export default ArticleDetails;
