import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const contentSchema = new Schema({
    link: {
        type: String
    },
    title: {
        type: String
    },
    tags: [
        {
            type: mongoose.Types.ObjectId,
            ref:"Tag"
        }
    ],
    type: String,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const linkSchema = new Schema(
    {
        hash: String,
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        }
    }
)

const TweetSchema = new Schema(
    {
        url: String,
        user:{
            type: mongoose.Types.ObjectId,
            ref:'User'
        }
    },
    {
        timestamps: true
    }
)

const YoutubeSchema = new Schema(
    {
        url: String,
        user:{
            type: mongoose.Types.ObjectId,
            ref:'User'
        }
    },
    {
        timestamps: true
    }
)

export const YoutubeModel = model('Youtube', YoutubeSchema)
export const LinkModel =  model('Links', linkSchema)
export const UserModel =  model("User", userSchema)
export const ContentModel =  model('Content', contentSchema)
export const TweetModel = model('Tweet', TweetSchema)