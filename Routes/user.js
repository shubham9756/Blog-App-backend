const express = require('express');
const router = express.Router();

const { handleBlogs, upload, verifyAuth, handleRegister, handleLogin, chechUser ,handleLogout,sendBlogs,HandleViewBlog,handleLikes,handleMyBlog,handleEditBlog,updateBlogData,handleDeleteBlog,HandleEmailSender,verifyOtp,handleNewPassword} = require('../controller/blogs');

const {getCommentsByBlog}=require('../controller/comment')

router.get("/checkUser",chechUser);

router.post("/register", upload.single("profileImage"), handleRegister);

router.post("/login", handleLogin);

router.post("/blogs", verifyAuth, upload.single("thumbnail"), handleBlogs);

router.get("/logout",verifyAuth, handleLogout);

router.get("/blogs",verifyAuth,sendBlogs)

router.get("/viewBlog/:id",verifyAuth,HandleViewBlog);

router.post("/likes/:id",verifyAuth,handleLikes)

router.get("/comments/:blogId", verifyAuth, getCommentsByBlog);

router.get("/myBlog/:id",verifyAuth,handleMyBlog)

router.get("/blog/:id",verifyAuth,handleEditBlog)

router.put("/blog/update/:id",verifyAuth,upload.single("thumbnail"),updateBlogData)

router.delete("/blog/delete/:id",verifyAuth,handleDeleteBlog )

router.post("/forgotPassword",HandleEmailSender)

router.post("/verify-otp",verifyOtp)

router.post("/set-newpassword",handleNewPassword)

module.exports = router;