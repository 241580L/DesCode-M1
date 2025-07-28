// client/src/pages/Reviews.jsx
import {
    AccountCircle, AccessTime, Search, Clear, Edit, ThumbUp, ThumbDown, Chat
} from '@mui/icons-material';
import React, { useContext, useEffect, useState, useRef } from 'react';
import UserContext from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardContent, Input, IconButton, Button, Avatar, Divider,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import dayjs from 'dayjs';
import global from '../global';
import http from '../http';
import StarRating from '../components/StarRating';

const SEARCH_OPTIONS = [
    { value: 'title', label: 'Title only' },
    { value: 'content', label: 'Contents only' },
    { value: 'all', label: 'Title and Contents' },
];

function Reviews() {
    const [reviewList, setReviewList] = useState([]);
    const [search, setSearch] = useState('');
    const [searchScope, setSearchScope] = useState('all');
    const { user } = useContext(UserContext);

    // For debounce
    const debounceTimeout = useRef();

    const getReviews = () => {
        http.get('/reviews').then((res) => {
            setReviewList(res.data.filter(r => !r.deleted));
        });
    };

    const searchReviews = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (searchScope) params.append('scope', searchScope);
        http.get(`/reviews?${params.toString()}`)
            .then((res) => setReviewList(res.data));
    };
    // After useState declarations
    const toggleLike = (id) => {
        http.post(`/reviews/${id}/vote`, { upvote: true })
            .then(res => {
                setReviewList(prev =>
                    prev.map(r => r.id === id
                        ? {
                            ...r,
                            liked: !r.liked,
                            disliked: false,
                            upvotes: res.data.upvotes,
                            downvotes: res.data.downvotes
                        }
                        : r
                    )
                );
            })
            .catch(err => console.error("Failed to toggle like vote:", err));
    };

    const toggleDislike = (id) => {
        http.post(`/reviews/${id}/vote`, { upvote: false })
            .then(res => {
                setReviewList(prev =>
                    prev.map(r => r.id === id
                        ? {
                            ...r,
                            liked: false,
                            disliked: !r.disliked,
                            upvotes: res.data.upvotes,
                            downvotes: res.data.downvotes
                        }
                        : r
                    )
                );
            })
            .catch(err => console.error("Failed to toggle dislike vote:", err));
    };


    useEffect(() => { getReviews(); }, []);

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout if search or scope changes
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        // Only search if there's a search term, otherwise show all
        if (search) {
            debounceTimeout.current = setTimeout(() => {
                searchReviews();
            }, 400); // 400ms debounce
        } else {
            // If search is cleared, show all reviews
            getReviews();
        }
        // Clean up on unmount
        return () => clearTimeout(debounceTimeout.current);
        // eslint-disable-next-line
    }, [search, searchScope]);

    const onSearchChange = (e) => setSearch(e.target.value);
    const onScopeChange = (e) => setSearchScope(e.target.value);
    const onClickClear = () => { setSearch(''); getReviews(); };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2, fontWeight: 'bold' }}>
                Reviews
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input
                    value={search}
                    placeholder="Search"
                    onChange={onSearchChange}
                    sx={{ flex: 1, mr: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                    <InputLabel id="search-scope-label">Search in</InputLabel>
                    <Select
                        labelId="search-scope-label"
                        value={searchScope}
                        label="Search in"
                        onChange={onScopeChange}
                    >
                        {SEARCH_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <IconButton color="primary" onClick={searchReviews}><Search /></IconButton>
                <IconButton color="primary" onClick={onClickClear}><Clear /></IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {user && (
                    <Link to="/addreview" style={{ textDecoration: 'none' }}>
                        <Button variant='contained'>Add Review</Button>
                    </Link>
                )}
            </Box>
            <Grid container spacing={3}>
                {reviewList.map((review) => (
                    <Grid item xs={12} md={6} lg={4} key={review.id}>
                        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                                        {review.reviewer?.name?.[0] || <AccountCircle />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: -0.5, mt: -1 }}>
                                            {review.reviewer?.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            <AccessTime sx={{ verticalAlign: 'middle', mr: 0.5 }} fontSize="small" />
                                            {dayjs(review.createdAt || review.postDateTime).format(global.datetimeFormat)}
                                        </Typography>
                                    </Box>
                                    {user && user.id === review.reviewerId && (
                                        <Link to={`/editreview/${review.id}`}>
                                            <IconButton color="primary" sx={{ p: '4px' }}>
                                                <Edit />
                                            </IconButton>
                                        </Link>
                                    )}
                                </Box>

                                <Divider sx={{ mb: 1 }} />

                                <Link
                                    to={`/reviews/${review.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {review.title}
                                    </Typography>
                                    <StarRating value={review.stars} readOnly size="small" />
                                    <Typography sx={{ mt: 1, mb: 1 }}>{review.description}</Typography>
                                </Link>

                                {/* ✳️ New Row: Likes + Dislikes + Replies */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: -1 }}>
                                    <Box sx={{ gap: 0 }}>
                                        <IconButton
                                            color={user && review.liked ? 'success' : 'default'}
                                            onClick={() => toggleLike(review.id)}
                                        >
                                            <ThumbUp fontSize="small" />
                                        </IconButton>
                                        <Typography variant="caption">{review.upvotes ?? 0}</Typography>
                                    </Box>
                                    <Box sx={{ gap: 0 }}>
                                        <IconButton
                                            color={user && review.disliked ? 'error' : 'default'}
                                            onClick={() => toggleDislike(review.id)}
                                        >
                                            <ThumbDown fontSize="small" />
                                        </IconButton>
                                        <Typography variant="caption">{review.downvotes ?? 0}</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Box sx={{ gap: 0 }}>
                                        <IconButton disabled>
                                            <Chat fontSize="small" />
                                        </IconButton>
                                        <Typography variant="caption">
                                            {review.replyCount || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>

                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Reviews;