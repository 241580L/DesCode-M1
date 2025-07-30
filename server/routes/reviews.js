// server/routes/reviews.js
const express = require('express');
const router = express.Router();
const { User, Review, ReviewReply, Admin, ReviewVote } = require('../models');
const { wiz } = require('../utils');
const { Op, fn, col } = require("sequelize");
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");

// Spam filter: simple example (check for too many similar submissions)
let recentSubmissions = {}; // keyed by userId

const SPAM_LIMIT = 3; // Max allowed similar submissions in the last 5 minutes

function isSpam(userId, content) {
    const now = Date.now();
    console.log(recentSubmissions);
    // initialize list if missing
    if (!recentSubmissions[userId]) {
        recentSubmissions[userId] = [];
    }
    // remove old entries
    recentSubmissions[userId] = recentSubmissions[userId].filter(
        sub => now - sub.time < 5 * 60 * 1000
    );
    // count similar
    const similarCount = recentSubmissions[userId].filter(
        sub =>
            sub.content.includes(content.title) ||
            sub.content.includes(content.description)
    ).length;
    if (similarCount >= SPAM_LIMIT) return true;
    recentSubmissions[userId].push({ content: `${content.title} ${content.description}`, time: now });
    return false;
}

// CREATE Review
router.post("/", validateToken, async (req, res) => {
    let data = req.body;
    data.reviewerId = req.user.id;
    if (isSpam(req.user.id, data)) { // <--- pass userId and content
        return res.status(400).json({ error: "Spam detected. Too many similar submissions." });
    }
    // Validate request body
    const validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100).required(),
        description: yup.string().trim().min(3).max(500).required(),
        stars: yup.number().min(1).max(5).required()
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        data.reviewerId = req.user.id; // Ensure reviewerId is set
        const result = await Review.create(data);
        // Optionally, include reviewer info in response
        const reviewWithUser = await Review.findByPk(result.id, {
            include: { model: User, as: 'reviewer', attributes: ['name'] }
        });
        res.json(reviewWithUser);
    } catch (err) {
        wiz(err, `Error while creating review:`)
        res.status(400).json({ errors: err.errors });
    }
});

// GET all reviews (with search)
// GET /reviews?search=...&scope=...
router.get('/', async (req, res) => {
    // Get logged-in user ID, if available
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = require('jsonwebtoken').verify(token, process.env.APP_SECRET);
            userId = decoded.id;
        } catch (err) {
            // Invalid token → user stays "not logged in"
            userId = null;
        }
    }

    try {
        const { search, scope } = req.query;
        let where = {};
        if (search) {
            if (scope === 'title') {
                where.title = { [Op.like]: `%${search}%` };
            } else if (scope === 'content') {
                where.description = { [Op.like]: `%${search}%` };
            } else {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }
        }

        const reviewsRaw = await Review.findAll({
            where: { ...where, deleted: false },
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'name'] },
                { model: ReviewReply, as: 'replies', attributes: [] },
                {
                    model: ReviewVote,
                    as: 'reviewVotes',
                    where: userId ? { UserID: userId } : undefined,
                    required: false,
                    attributes: ['Upvote']
                }
            ],
            attributes: {
                include: [[fn('COUNT', col('replies.ReplyID')), 'replyCount']]
            },
            group: ['Review.id', 'reviewer.id', 'reviewVotes.ReviewID', 'reviewVotes.UserID'],
            order: [['postDateTime', 'DESC']]
        });

        // Post-process to set liked/disliked
        const reviews = reviewsRaw.map(r => {
            const vote = r.reviewVotes?.[0];
            return {
                ...r.get({ plain: true }),
                liked: vote?.Upvote === true,
                disliked: vote?.Upvote === false
            };
        });

        res.json(reviews);
    } catch (err) {
        wiz(err, "Error while fetching reviews with reply counts:");
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
});


// GET review by id with per-user vote info
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    let userId = null;

    // Extract user from auth token, if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = require('jsonwebtoken').verify(token, process.env.APP_SECRET);
            userId = decoded.id;
        } catch (err) {
            userId = null;
        }
    }
    try {
        // Get review with reviewer info and vote (if userId present)
        const reviewObj = await Review.findByPk(id, {
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'name'] },
                {
                    model: ReviewVote,
                    as: 'reviewVotes',
                    where: userId ? { UserID: userId } : undefined,
                    required: false,
                    attributes: ['Upvote']
                }
            ]
        });

        // Not found or deleted
        if (!reviewObj || reviewObj.deleted) return res.sendStatus(404);

        // Prepare response object
        const plainReview = reviewObj.get({ plain: true });
        const vote = plainReview.reviewVotes?.[0];
        const response = {
            ...plainReview,
            liked: vote?.Upvote === true,
            disliked: vote?.Upvote === false
        };

        res.json(response);
    } catch (err) {
        wiz(err, `Error fetching review #${id}`);
        res.status(500).json({ error: "Failed to fetch review." });
    }
});

// GET replies for a review
router.get('/:id/replies', async (req, res) => {
    try {
        const replies = await ReviewReply.findAll({
            where: { ReviewID: req.params.id, deleted: false },  // <-- exclude deleted
            include: [{ model: User, as: 'Replier', attributes: ['name', 'email'] }],
            order: [['PostDateTime', 'ASC']],
        });
        res.json(replies);
    } catch (err) {
        wiz(err, 'Error fetching replies:');
        res.status(500).json({ error: 'Failed to fetch replies' });
    }
});

// UPDATE review (with soft delete support)
router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let userId = req.user.id;
    try {
        const review = await Review.findByPk(id);
        if (!review || review.deleted) {
            res.sendStatus(404);
            return;
        }
        if (review.reviewerId !== userId) {
            res.sendStatus(403);
            return;
        }

        // Handle soft delete
        if (req.body.deleted === true) {
            const num = await Review.update(
                { deleted: true, editDateTime: new Date() },
                { where: { id } }
            );
            if (num[0] === 1) {
                res.json({ message: "Review was deleted (soft) successfully." });
            } else {
                res.status(400).json({ message: `Cannot delete review with id ${id}.` });
            }
            return;
        }

        // Only allow updating certain fields
        const { title, description, stars } = req.body;
        const num = await Review.update(
            { title, description, stars, editDateTime: new Date() },
            { where: { id } }
        );
        if (num[0] === 1) {
            res.json({ message: "Review was updated successfully." });
        } else {
            res.status(400).json({ message: `Cannot update review with id ${id}.` });
        }
    } catch (err) {
        wiz(err, `Error while updating review #${id}:`)
        res.status(500).json({ error: "Failed to update review." });
    }
});

// SOFT DELETE review
router.delete("/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    try {
        const review = await Review.findByPk(id);
        if (!review || review.deleted) {
            return res.sendStatus(404);
        }
        if (review.reviewerId !== userId) {
            return res.sendStatus(403);
        }
        review.deleted = true;
        await review.save();  // single update to mark deleted
        return res.json({ message: "Review was deleted successfully." });
    } catch (err) {
        wiz(err, `Error while deleting review #${id}:`);
        return res.status(500).json({ error: "Failed to delete review." });
    }
});

// POST /reviews/:id/vote
router.post('/:id/vote', validateToken, async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;
    const { upvote } = req.body;

    if (typeof upvote !== 'boolean') {
        return res.status(400).json({ error: "Invalid vote value. Must be boolean." });
    }

    try {
        const existingVote = await ReviewVote.findOne({
            where: { ReviewID: reviewId, UserID: userId }
        });

        if (existingVote) {
            // If the vote is same as before, delete (toggle off)
            if (existingVote.Upvote === upvote) {
                await existingVote.destroy();
            } else {
                existingVote.Upvote = upvote;
                await existingVote.save();
            }
        } else {
            await ReviewVote.create({
                ReviewID: reviewId,
                UserID: userId,
                Upvote: upvote
            });
        }

        // Get updated vote counts
        const upvotes = await ReviewVote.count({
            where: { ReviewID: reviewId, Upvote: true }
        });
        const downvotes = await ReviewVote.count({
            where: { ReviewID: reviewId, Upvote: false }
        });

        // Update the review record
        await Review.update(
            { upvotes, downvotes },
            { where: { id: reviewId } }
        );

        res.json({ message: "Vote updated", upvotes, downvotes });

    } catch (err) {
        wiz(err, "Error processing vote:");
        res.status(500).json({ error: "Failed to process vote." });
    }
});

// REPLY
router.post('/:id/replies', validateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can reply.' });
        }
        const reviewId = parseInt(req.params.id);
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Reply content cannot be empty.' });
        }
        // Create the reply
        const newReply = await ReviewReply.create({
            ReviewID: reviewId,
            Content: content.trim(),
            ReplierID: req.user.id,
            PostDateTime: new Date(),
        });

        // Reload reply with Replier data
        const replyWithUser = await ReviewReply.findByPk(newReply.ReplyID, {
            include: [{ model: User, as: 'Replier', attributes: ['name'] }],
        });

        res.json(replyWithUser);
    } catch (err) {
        wiz(err, "Error adding reply");
        res.status(500).json({ message: 'Failed to add reply.' });
    }
});

// Edit reply
router.put('/replies/:replyId', validateToken, async (req, res) => {
    try {
        const replyId = req.params.replyId;
        const userId = req.user.id;
        const isAdmin = req.user.isAdmin;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Reply content cannot be empty.' });
        }

        const reply = await ReviewReply.findByPk(replyId);

        if (!reply || reply.deleted) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        // Only allow admins or the replier themselves to edit their reply
        if (!isAdmin && reply.ReplierID !== userId) {
            return res.sendStatus(403);
        }

        reply.Content = content.trim();
        reply.EditDateTime = new Date();
        await reply.save();

        // Return updated reply with user
        const updatedReply = await ReviewReply.findByPk(replyId, {
            include: [{ model: User, as: 'Replier', attributes: ['name'] }],
        });

        res.json(updatedReply);
    } catch (err) {
        wiz(err, 'Error updating reply:');
        res.status(500).json({ message: 'Failed to update reply.' });
    }
});


// Delete reply
router.delete('/replies/:replyId', validateToken, async (req, res) => {
    try {
        const replyId = req.params.replyId;
        const userId = req.user.id;
        const isAdmin = req.user.isAdmin;

        const reply = await ReviewReply.findByPk(replyId);

        if (!reply || reply.deleted) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        // Only allow admins or the replier themselves to delete their reply
        if (!isAdmin && reply.ReplierID !== userId) {
            return res.sendStatus(403);
        }

        reply.deleted = true;
        await reply.save();

        res.json({ message: 'Reply deleted successfully.' });
    } catch (err) {
        wiz(err, 'Error deleting reply:');
        res.status(500).json({ message: 'Failed to delete reply.' });
    }
});

module.exports = router;