const multer = require('multer');
const { User } = require("../model/register")
const { Blog } = require("../model/blogSchema");
const path = require("path")
const fs = require("fs")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");


const SECRETKEY = "hjkmsbd"

const verifyAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(token, SECRETKEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/upload/')
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage });

const chechUser = async (req, res) => {
    const token = req.cookies.token;

    try {
        if (!token) {
            return res.json({ loggedIn: false, message: "No token provided", user: null });
        }
        const decoded = jwt.verify(token, SECRETKEY);
        const user = await User.findOne({ email: decoded.email })
        if (!user) {
            return res.json({ loggedIn: false, message: "User not found", user: null });
        }
        res.json({ loggedIn: true, message: "User authenticated", user });

    } catch (err) {
        res.json({ loggedIn: false, message: "Invalid token", user: null });
    }
};

const handleRegister = async (req, res) => {
    try {
        const { username, email, password, mobile } = req.body;
        const profileImage = req.file?.filename;
        const checkUser = await User.findOne({ email: email });

        if (checkUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!username || !email || !password || !mobile) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password too short" });
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            mobile,
            password: passwordHash,
            profileImage
        });

        res.json({ success: true, message: "User registered", user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRETKEY,
            { expiresIn: "10d" }
        );

       res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",   // MUST for cross-domain
  secure: true,       // MUST for HTTPS (Vercel)
  maxAge: 10 * 24 * 60 * 60 * 1000,
  path: "/"
});


        res.json({
            success: true,
            message: "Login successful",
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const handleLogout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    }
    );
    res.json({ success: true, message: "Logged out successfully" });
}

const handleBlogs = async (req, res) => {

    const { title, category, description, content } = req.body;
    const thumbnail = req.file?.filename;

    if (!title || !thumbnail) {
        return res.json({ success: false, message: "Missing data" });
    }
    const data = await Blog.create({
        userId: req.user.id,
        title,
        category,
        description,
        content,
        thumbnail
    });
    res.json({
        success: true,
        message: "Blog created",
        data: data
    });
}

const sendBlogs = async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    if (!blogs) {
        return res.json({
            success: false,
            message: "No blogs found"
        });
    }
    res.json({
        success: true,
        message: "Blogs fetched successfully",
        blogs: blogs
    });
}

const HandleViewBlog = async (req, res) => {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.json({
            success: false,
            message: "Blog not found"
        });
    }
    res.json({
        success: true,
        message: "Blog fetched successfully",
        blog: blog
    });
}

const handleLikes = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        const index = blog.likes.findIndex(
            like => like.user.toString() === userId
        );

        let likedByUser = false;

        if (index !== -1) {
            // UNLIKE
            blog.likes.splice(index, 1);
        } else {
            // LIKE
            blog.likes.push({ user: userId });
            likedByUser = true;
        }

        await blog.save();

        res.json({
            success: true,
            likes: blog.likes,          // 🔥 full updated likes array
            totalLikes: blog.likes.length,
            likedByUser
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const handleMyBlog = async (req, res) => {
    try {
        // const userId = req.params.id;
        const userId = req.user.id
        console.log("UserId:", userId);

        const data = await Blog.find({ userId: userId });

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({
            success: true,
            data,
            message: "Data Available"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

const handleEditBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.json({
                success: false,
                message: "Blog not found",
            });
        }

        res.json({
            success: true,
            data: blog,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}
const updateBlogData = async (req, res) => {
    try {
        const { title, description, content } = req.body;

        const updateData = {
            title,
            description,
            content,
        };

        // If new image uploaded
        if (req.file) {
            updateData.thumbnail = req.file.filename;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedBlog) {
            return res.json({
                success: false,
                message: "Update failed",
            });
        }

        res.json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}

const handleDeleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.json({
                success: false,
                message: "Blog not found",
            });
        }

        // 🔥 Delete image from folder
        if (blog.thumbnail) {
            const imagePath = path.join(
                __dirname,
                "../public/upload",
                blog.thumbnail
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // 🔥 Delete blog from DB
        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Blog deleted successfully",
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}

const HandleEmailSender = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)
        if (!email) {
            return res.json({
                success: false,
                message: "Email required"
            });
        }

        // 🔢 generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ⏱ expiry (5 min)
        const expiry = Date.now() + 5 * 60 * 1000;

        // 💾 STORE IN SESSION
        req.session.otp = otp;
        req.session.email = email;
        req.session.otpExpiry = expiry;

        console.log("SESSION OTP:", req.session.otp);
        console.log("SESSION EMAIL:", email);

        // ✉️ mail setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "skarad819@gmail.com",
                pass: "dmxy rpxl klxw pyis"
            }
        });

        const mailOptions = {
            from: "skarad819@gmail.com",
            to: email,
            subject: "Your OTP Code",
            html: `
        <h2>Forgot The Blog Application Password </h2>
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP is valid for 1 minutes</p>
      `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "OTP sent to email",
            expiry: req.session.otpExpiry
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

const verifyOtp = (req, res) => {
    const { otp } = req.body;


    if (!otp) {
        return res.json({ success: false, message: "OTP required" });
    }

    // ⏱ expiry check
    if (Date.now() > req.session.otpExpiry) {
        return res.json({ success: false, message: "OTP expired" });
    }
    // 🔍 OTP match
    if (req.session.otp !== otp) {
        return res.json({ success: false, message: "Invalid OTP" });
    }

    req.session.otpVerified = true;
    req.session.save(() => {
        res.json({
            success: true,
            message: "OTP verified",
            email: req.session.email
        });
    });


};


const handleNewPassword = async (req, res) => {
    try {
        const password = req.body?.password;
        const mail = req.session?.email;

        if (!req.session.otpVerified) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please try again."
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password not received"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findOneAndUpdate(
            { email: mail },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 5️⃣ Destroy session after reset
        req.session.destroy(() => { });

        // 6️⃣ Success response
        res.json({
            success: true,
            message: "Password updated successfully. Please login again."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Try again later."
        });
    }
};





module.exports = { handleBlogs, upload, handleRegister, handleLogin, verifyAuth, chechUser, handleLogout, sendBlogs, HandleViewBlog, handleLikes, handleMyBlog, handleEditBlog, updateBlogData, handleDeleteBlog, HandleEmailSender, verifyOtp, handleNewPassword };
