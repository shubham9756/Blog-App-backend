const Comment = require("../model/Comment")


// 🔹 Add comment (Socket use करतो)
const addComment = async ({ blogId, userId, text }) => {


    const newComment = await Comment.create({
        blogId,
        userId,
        comment: text
    });

    await newComment.populate("userId", "username");

    return newComment;
};

// 🔹 Get all comments of a blog (REST API)
const getCommentsByBlog = async (req, res) => {
    try {
        const comments = await Comment.find({
            blogId: req.params.blogId,
            isActive: true
        })
            .populate("userId", "username")
            .sort({ createdAt: 1 });

        res.json({ success: true, comments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = { getCommentsByBlog, addComment }