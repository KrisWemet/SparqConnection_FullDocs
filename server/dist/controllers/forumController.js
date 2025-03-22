"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderatePost = exports.flagPost = exports.createComment = exports.getPostComments = exports.createPost = exports.getPosts = void 0;
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const ForumComment_1 = __importDefault(require("../models/ForumComment"));
const socket_1 = require("../socket");
const ITEMS_PER_PAGE = 10;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const category = req.query.category;
        const search = req.query.search;
        const query = { isModerated: true };
        if (category)
            query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        const totalPosts = yield ForumPost_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
        const posts = yield ForumPost_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .populate('author', 'firstName lastName')
            .populate('commentCount');
        res.json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasMore: page < totalPages
            }
        });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});
exports.getPosts = getPosts;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, category, tags } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const post = yield ForumPost_1.default.create({
            title,
            content,
            author: userId,
            category,
            tags: tags || [],
            isModerated: false
        });
        yield post.populate('author', 'firstName lastName');
        // Emit event for real-time updates
        socket_1.io.emit('newForumPost', {
            post,
            message: 'New post created'
        });
        // Notify moderators
        socket_1.io.to('moderators').emit('moderationNeeded', {
            type: 'post',
            id: post._id,
            title: post.title
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});
exports.createPost = createPost;
const getPostComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const totalComments = yield ForumComment_1.default.countDocuments({
            post: postId,
            parentComment: null,
            isModerated: true
        });
        const totalPages = Math.ceil(totalComments / ITEMS_PER_PAGE);
        const comments = yield ForumComment_1.default.find({
            post: postId,
            parentComment: null,
            isModerated: true
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .populate('author', 'firstName lastName')
            .populate('repliesCount');
        res.json({
            comments,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments,
                hasMore: page < totalPages
            }
        });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});
exports.getPostComments = getPostComments;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const comment = yield ForumComment_1.default.create({
            post: postId,
            content,
            author: userId,
            parentComment: parentCommentId || null,
            isModerated: false
        });
        yield comment.populate('author', 'firstName lastName');
        // Emit event for real-time updates
        socket_1.io.to(`post_${postId}`).emit('newForumComment', {
            comment,
            message: 'New comment added'
        });
        // Notify moderators
        socket_1.io.to('moderators').emit('moderationNeeded', {
            type: 'comment',
            id: comment._id,
            postId
        });
        res.status(201).json(comment);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
});
exports.createComment = createComment;
const flagPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { postId } = req.params;
        const { reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const post = yield ForumPost_1.default.findByIdAndUpdate(postId, {
            isFlagged: true,
            moderationNotes: `Flagged by ${userId} - Reason: ${reason}`
        }, { new: true });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Notify moderators
        socket_1.io.to('moderators').emit('contentFlagged', {
            type: 'post',
            id: postId,
            reason,
            reportedBy: userId
        });
        res.json({ message: 'Post flagged for review' });
    }
    catch (error) {
        console.error('Error flagging post:', error);
        res.status(500).json({ message: 'Error flagging post' });
    }
});
exports.flagPost = flagPost;
const moderatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { postId } = req.params;
        const { approved, moderationNotes } = req.body;
        const moderatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.isModerator)) {
            res.status(403).json({ message: 'Unauthorized: Moderator access required' });
            return;
        }
        const post = yield ForumPost_1.default.findByIdAndUpdate(postId, {
            isModerated: true,
            isFlagged: false,
            moderationNotes: `Moderated by ${moderatorId} - ${moderationNotes}`,
            $set: { isHidden: !approved }
        }, { new: true });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Notify the post author
        socket_1.io.to(`user_${post.author}`).emit('postModerated', {
            postId,
            approved,
            moderationNotes
        });
        res.json({ message: 'Post moderated successfully', post });
    }
    catch (error) {
        console.error('Error moderating post:', error);
        res.status(500).json({ message: 'Error moderating post' });
    }
});
exports.moderatePost = moderatePost;
