const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true
            },
            likedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    createdAt: {
    type: Date,
    default: Date.now
},
    isActive: {
    type: Boolean,
    default: true
},
    
});
const Blog = mongoose.model('blog', blogSchema);
module.exports = { Blog };