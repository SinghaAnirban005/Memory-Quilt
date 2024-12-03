import mongoose, { Schema, Model } from "mongoose";

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

export const linkModel = new Model('Links', linkSchema)
export const userModel = new Model("User", userSchema)
export const contentModel = new Model('Content', contentSchema)