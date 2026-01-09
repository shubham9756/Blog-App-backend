const { addComment } = require("../controller/comment");
const Comment = require("../model/Comment");

module.exports = (io, socket) => {

  /*  Join blog room */
  socket.on("join-blog", (blogId) => {
    socket.join(blogId);
  });

  /*  Send comment */
  socket.on("send-comment", async ({ blogId, userId, text }) => {
    try {
      const comment = await addComment({ blogId, userId, text });

      
      io.to(blogId).emit("new-comment", comment);
    } catch (err) {
      console.log("Send comment error:", err);
    }
  });

  /*  Like comment */
  socket.on("like-comment", async ({ id, blogId }) => {
    try {
      const comment = await Comment.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!comment) return;

      io.to(blogId).emit("like-comment", {
        id: comment._id,
        likes: comment.likes,
      });

    } catch (err) {
      console.log("Like error:", err);
    }
  });

  /*  Delete comment */
  socket.on("delete-comment", async ({ id }) => {
    try {
        console.log("delete request:", id);

        // 1️⃣ DB मधून delete
        await Comment.findByIdAndDelete(id);

        // 2️⃣ All clients ला notify कर
        io.emit("delete-comment", id); // ⚠️ ONLY id send

    } catch (err) {
      console.log("Delete error:", err);
    }
  });

};
