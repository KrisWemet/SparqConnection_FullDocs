import ForumPost from '../models/ForumPost';
import ForumComment from '../models/ForumComment';
import { io } from '../socket';
const ITEMS_PER_PAGE = 10;
export const getPosts = async (req, res) => {
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
        const totalPosts = await ForumPost.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
        const posts = await ForumPost.find(query)
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
};
export const createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const userId = req.user?._id;
        const post = await ForumPost.create({
            title,
            content,
            author: userId,
            category,
            tags: tags || [],
            isModerated: false
        });
        await post.populate('author', 'firstName lastName');
        // Emit event for real-time updates
        io.emit('newForumPost', {
            post,
            message: 'New post created'
        });
        // Notify moderators
        io.to('moderators').emit('moderationNeeded', {
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
};
export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const totalComments = await ForumComment.countDocuments({
            post: postId,
            parentComment: null,
            isModerated: true
        });
        const totalPages = Math.ceil(totalComments / ITEMS_PER_PAGE);
        const comments = await ForumComment.find({
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
};
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = req.user?._id;
        const comment = await ForumComment.create({
            post: postId,
            content,
            author: userId,
            parentComment: parentCommentId || null,
            isModerated: false
        });
        await comment.populate('author', 'firstName lastName');
        // Emit event for real-time updates
        io.to(`post_${postId}`).emit('newForumComment', {
            comment,
            message: 'New comment added'
        });
        // Notify moderators
        io.to('moderators').emit('moderationNeeded', {
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
};
export const flagPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;
        const userId = req.user?._id;
        const post = await ForumPost.findByIdAndUpdate(postId, {
            isFlagged: true,
            moderationNotes: `Flagged by ${userId} - Reason: ${reason}`
        }, { new: true });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Notify moderators
        io.to('moderators').emit('contentFlagged', {
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
};
export const moderatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { approved, moderationNotes } = req.body;
        const moderatorId = req.user?._id;
        if (!req.user?.isModerator) {
            res.status(403).json({ message: 'Unauthorized: Moderator access required' });
            return;
        }
        const post = await ForumPost.findByIdAndUpdate(postId, {
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
        io.to(`user_${post.author}`).emit('postModerated', {
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
};
