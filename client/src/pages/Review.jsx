// client/src/pages/Review.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Divider,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Button,
    Paper,
    Alert
} from '@mui/material';
import { AccessTime, Edit, AccountCircle, ThumbUp, ThumbDown } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import global from '../global';
import http from '../http';
import StarRating from '../components/StarRating';
import UserContext from '../contexts/UserContext';

function Review() {
    const { id } = useParams(); // get review id from URL
    const [review, setReview] = useState(null);
    const [replies, setReplies] = useState([]);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'not_found'
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReview = () => {
        http.get(`/reviews/${id}`).then((res) => {
            setReview(res.data);
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

    useEffect(() => {
        fetchReview();
        if (user) {
            fetchVotes();
        }
        // eslint-disable-next-line
    }, [id]);

    if (loading) {
        return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <Box sx={{ mt: 4, }}>
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
                replies.map((reply) => (
                    <Paper key={reply.ReplyID} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 1 }}>{reply.Replier?.name?.[0]}</Avatar>
                            <Box>
                                <Typography variant="subtitle2">{reply.Replier?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {dayjs(reply.PostDateTime).format(global.datetimeFormat)}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{reply.Content}</Typography>
                    </Paper>
                ))
            )}
        </Box>
    );
}

export default Review;
