import { useState, useEffect } from 'react';
import './comments.styles.scss';
import Avatar from 'boring-avatars';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { realtimeDb } from '../../utils/firebase';
import { ref, push, onValue, remove} from 'firebase/database';
import { useToast } from '../../contexts/toast-context.context';
import { FaReply, FaTrash } from 'react-icons/fa';

const Comments = ({ videoCode }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUserAuthContext();
    const { showToast } = useToast();

    
    useEffect(() => {
        const commentsRef = ref(realtimeDb, `videoComments/${videoCode}`);
        
        const unsubscribe = onValue(commentsRef, (snapshot) => {
            if (!snapshot.exists()) {
                setComments([]);
                return;
            }
            
            const commentsData = snapshot.val();
            const commentsArray = Object.entries(commentsData).map(([id, comment]) => ({
                id,
                ...comment,
                replies: comment.replies ? Object.entries(comment.replies).map(([replyId, reply]) => ({
                    id: replyId,
                    ...reply
                })) : []
            }));
            
            setComments(commentsArray);
        });
        
        return () => unsubscribe();
    }, [videoCode]);

    const handleAddComment = async () => {
        if (!user) {
            showToast('Please sign in to add a comment');
            return;
        }
        
        if (!commentText.trim()) {
            showToast('Comment cannot be empty');
            return;
        }
        
        try {
            setIsSubmitting(true);
            const commentsRef = ref(realtimeDb, `videoComments/${videoCode}`);
            await push(commentsRef, {
                commentedBy: user.displayName || user.email.split('@')[0],
                userId: user.uid,
                text: commentText.trim(),
                timestamp: new Date().toISOString(),
                userEmail: user.email
            });
            
            setCommentText('');
            showToast('Comment added successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddReply = async (commentId) => {
        if (!user) {
            showToast('Please sign in to reply');
            return;
        }
        
        if (!replyText.trim()) {
            showToast('Reply cannot be empty');
            return;
        }
        
        try {
            setIsSubmitting(true);
            const replyRef = ref(realtimeDb, `videoComments/${videoCode}/${commentId}/replies`);
            await push(replyRef, {
                commentedBy: user.displayName || user.email.split('@')[0],
                userId: user.uid,
                text: replyText.trim(),
                timestamp: new Date().toISOString(),
                userEmail: user.email
            });
            
            setReplyText('');
            setReplyingTo(null);
            showToast('Reply added successfully');
        } catch (error) {
            console.error('Error adding reply:', error);
            showToast('Failed to add reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!user) return;
        
        try {
            const commentRef = ref(realtimeDb, `videoComments/${videoCode}/${commentId}`);
            await remove(commentRef);
            showToast('Comment deleted successfully');
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Failed to delete comment');
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        if (!user) return;
        
        try {
            const replyRef = ref(realtimeDb, `videoComments/${videoCode}/${commentId}/replies/${replyId}`);
            await remove(replyRef);
            showToast('Reply deleted successfully');
        } catch (error) {
            console.error('Error deleting reply:', error);
            showToast('Failed to delete reply');
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHour < 24) return `${diffHour} hours ago`;
        if (diffDay < 30) return `${diffDay} days ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className='comments-container'>
            <div className='head'>{comments.length} Comments</div>
            
            <div className='add-comment'>
                <Avatar 
                    size={40} 
                    name={user ? user.email : 'guest'} 
                    variant="beam" 
                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                />
                <input 
                    className='c-input' 
                    placeholder='Add a comment' 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting || !user}
                />
                <button 
                    className='c-btn' 
                    onClick={handleAddComment}
                    disabled={isSubmitting || !commentText.trim() || !user}
                >
                    Post
                </button>
            </div>
            
            <div className='comments-list'>
                {comments.map((comment) => (
                    <div key={comment.id} className='comment'>
                        <div className='comment-main'>
                            <Avatar 
                                size={32} 
                                name={comment.userEmail || comment.commentedBy} 
                                variant="beam" 
                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                className='avatar'
                            />
                            <div className='content'>
                                <div className='comment-header'>
                                    <span className='username'>{comment.commentedBy}</span>
                                    <span className='timestamp'>{formatTimestamp(comment.timestamp)}</span>
                                </div>
                                <p className='comment-text'>{comment.text}</p>
                                <div className='comment-actions'>
                                    <button 
                                        className='action-btn reply-btn'
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    >
                                        <FaReply /> Reply
                                    </button>
                                    {user && user.uid === comment.userId && (
                                        <button 
                                            className='action-btn delete-btn'
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {replyingTo === comment.id && (
                            <div className='reply-form'>
                                <Avatar 
                                    size={24} 
                                    name={user ? user.email : 'guest'} 
                                    variant="beam" 
                                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                />
                                <input 
                                    className='c-input' 
                                    placeholder='Write a reply...' 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={isSubmitting || !user}
                                />
                                <button 
                                    className='c-btn' 
                                    onClick={() => handleAddReply(comment.id)}
                                    disabled={isSubmitting || !replyText.trim() || !user}
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                        
                        {comment.replies && comment.replies.length > 0 && (
                            <div className='replies'>
                                <p className='replies-count'>{comment.replies.length} replies</p>
                                <div className='replies-list'>
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className='reply'>
                                            <Avatar 
                                                size={24} 
                                                name={reply.userEmail || reply.commentedBy} 
                                                variant="beam" 
                                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                                className='avatar'
                                            />
                                            <div className='content'>
                                                <div className='comment-header'>
                                                    <span className='username'>{reply.commentedBy}</span>
                                                    <span className='timestamp'>{formatTimestamp(reply.timestamp)}</span>
                                                </div>
                                                <p className='comment-text'>{reply.text}</p>
                                                {user && user.uid === reply.userId && (
                                                    <button 
                                                        className='action-btn delete-btn small'
                                                        onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {comments.length === 0 && (
                    <div className='no-comments'>
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;