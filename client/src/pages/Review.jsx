import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Container, Typography, Divider, CircularProgress, Card,
    CardContent, Avatar, IconButton, Button, Paper, Alert, TextField
} from '@mui/material';
import { AccessTime, Edit, AccountCircle, ThumbUp, ThumbDown } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import global from '../global';
import http from '../http';
import StarRating from '../components/StarRating';
import UserContext from '../contexts/UserContext';
import useTitle from '../Title.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Review() {

    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [replies, setReplies] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'not_found'
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [postingReply, setPostingReply] = useState(false);
    const [replyError, setReplyError] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyContent, setEditingReplyContent] = useState('');

    // At the top of your Review component function, after hooks like useState, useContext, etc.:
    useTitle(
        status === 'success' && review ?
            review.title :
            status === 'not_found' ?
                "Review Not Found" :
                "Loading Review..."
    );

    const fetchReview = () => {
        http.get(`/reviews/${id}`).then((res) => {
            setReview(res.data);
            setStatus('success');
        }).catch(() => {
            setStatus('not_found');
            setError('Review not found.');
        }).finally(() => setLoading(false));
    };

    const fetchVotes = () => {
        http.get(`/reviews?search=${id}`).then(res => {
            const r = res.data.find(r => r.id == id);
            if (r) {
                setReview((prev) => ({
                    ...prev,
                    liked: r.liked,
                    disliked: r.disliked,
                    upvotes: r.upvotes,
                    downvotes: r.downvotes,
                }));
            }
        });
    };

    const toggleLike = () => {
        http.post(`/reviews/${id}/vote`, { upvote: true })
            .then((res) => {
                setReview((prev) => ({
                    ...prev,
                    liked: !prev.liked,
                    disliked: false,
                    upvotes: res.data.upvotes,
                    downvotes: res.data.downvotes,
                }));
            });
    };

    const toggleDislike = () => {
        http.post(`/reviews/${id}/vote`, { upvote: false })
            .then((res) => {
                setReview((prev) => ({
                    ...prev,
                    liked: false,
                    disliked: !prev.disliked,
                    upvotes: res.data.upvotes,
                    downvotes: res.data.downvotes,
                }));
            });
    };

    const postReply = async () => {
        if (!replyContent.trim()) {
            toast.error('Reply content cannot be empty.');
            return;
        }
        setPostingReply(true);
        setReplyError('');
        try {
            await http.post(`/reviews/${id}/replies`, { content: replyContent.trim() });
            setReplyContent('');
            // Refresh replies
            const res = await http.get(`/reviews/${id}/replies`);
            setReplies(res.data);
            toast.success('Reply added successfully.');
        } catch (err) {
            toast.error('Failed to post reply. Please try again.');
        } finally {
            setPostingReply(false);
        }
    };

    const fetchReplies = () => {
        http.get(`/reviews/${id}/replies`).then(res => {
            setReplies(res.data);
        }).catch(err => {
            console.error("Failed to fetch replies:", err);
        });
    };

    const startEditingReply = (reply) => {
        setEditingReplyId(reply.ReplyID);
        setEditingReplyContent(reply.Content);
    };

    const cancelEditingReply = () => {
        setEditingReplyId(null);
        setEditingReplyContent('');
    };

    const saveEditedReply = async () => {
        if (!editingReplyContent.trim()) {
            toast.error('Reply content cannot be empty.');
            return;
        }
        try {
            await http.put(`/reviews/replies/${editingReplyId}`, {
                content: editingReplyContent.trim(),
            });
            cancelEditingReply();
            fetchReplies();
            toast.success('Reply updated successfully.');
        } catch (err) {
            toast.error('Failed to update reply. Please try again.');
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;
        try {
            await http.delete(`/reviews/replies/${replyId}`);
            // Refetch replies
            fetchReplies();
            toast.success('Reply deleted successfully.');
        } catch (err) {
            toast.error('Failed to delete reply. Try again.');
        }
    };

    useEffect(() => {
        fetchReview();
        if (user) {
            fetchVotes();
        }
        fetchReplies();
        // eslint-disable-next-line
    }, [id]);

    if (loading) {
        return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <Container sx={{ mt: 3, }}>
            <Link to={`/reviews/`}>
                <Button variant="outlined" sx={{ mb: 2, }}>
                    &lt;&lt; Back
                </Button>
            </Link>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                            {review.reviewer?.name?.[0] || <AccountCircle />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: -.5, mt: -1 }}>
                                {review.reviewer?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                <AccessTime sx={{ verticalAlign: 'middle', fontSize: 16, mr: 0.5 }} />
                                {dayjs(review.postDateTime || review.createdAt).format(global.datetimeFormat)}
                            </Typography>
                        </Box>

                        {/* 🆕 Edit Button (Only show if user is the reviewer) */}
                        {user && user.id === review.reviewerId && (
                            <Link to={`/editreview/${review.id}`}>
                                <Button variant="outlined" >
                                    <Edit sx={{ mr: 1 }} />Edit Review
                                </Button>
                            </Link>
                        )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Star Rating */}
                    <StarRating value={review.stars} readOnly size="small" />

                    {/* Review Content */}
                    <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
                        {review.title}
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{review.description}</Typography>
                    {/* Like/Dislike Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <IconButton
                            color={user && review.liked ? 'success' : 'default'}
                            onClick={toggleLike}
                            disabled={!user}
                        >
                            <ThumbUp />
                        </IconButton>
                        <Typography variant="caption">{review.upvotes ?? 0}</Typography>

                        <IconButton
                            color={user && review.disliked ? 'error' : 'default'}
                            onClick={toggleDislike}
                            disabled={!user}
                        >
                            <ThumbDown />
                        </IconButton>
                        <Typography variant="caption">{review.downvotes ?? 0}</Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Replies Section */}
            <Typography variant="h5" sx={{ mb: 1 }}>
                Admin Replies
            </Typography>

            {replies.length === 0 ? (
                <Typography color="text.secondary">No replies yet.</Typography>
            ) : (
                replies
                    .filter((r) => !r.deleted)
                    .map((reply) => {
                        const canEdit = user && (user.isAdmin || user.id === reply.ReplierID);
                        const isEditing = editingReplyId === reply.ReplyID;

                        return (
                            <Paper key={reply.ReplyID} sx={{ mb: 2, p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ mr: 1 }}>{reply.Replier?.name?.[0]}</Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2">{reply.Replier?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(reply.PostDateTime).format(global.datetimeFormat)}
                                            {reply.EditDateTime && ' (edited)'}
                                        </Typography>
                                    </Box>
                                    {canEdit && !isEditing && (
                                        <Button size="small" onClick={() => startEditingReply(reply)}>
                                            Edit
                                        </Button>
                                    )}
                                    {(user && (user.isAdmin || user.id === reply.ReplierID)) && (
                                        <Button size="small" color="error" onClick={() => handleDeleteReply(reply.ReplyID)}>
                                            Delete
                                        </Button>
                                    )}
                                </Box>

                                {isEditing ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            value={editingReplyContent}
                                            onChange={(e) => setEditingReplyContent(e.target.value)}
                                            sx={{ mb: 1 }}
                                        />
                                        {replyError && (
                                            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                                                {replyError}
                                            </Typography>
                                        )}
                                        <Button variant="contained" size="small" onClick={saveEditedReply} sx={{ mr: 1 }}>
                                            Save
                                        </Button>
                                        <Button variant="outlined" size="small" onClick={cancelEditingReply}>
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{reply.Content}</Typography>
                                )}
                            </Paper>
                        );
                    })
            )}

            {user && user.isAdmin && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Add a Reply</Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        disabled={postingReply}
                        placeholder="Write your reply here..."
                        sx={{ mt: 1, mb: 1 }}
                    />
                    {replyError && (
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {replyError}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={postReply}
                        disabled={postingReply}
                    >
                        {postingReply ? 'Posting...' : 'Submit Reply'}
                    </Button>
                </Box>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
}

export default Review;
