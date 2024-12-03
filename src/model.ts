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

export const linkModel =  model('Links', linkSchema)
export const userModel =  model("User", userSchema)
export const contentModel =  model('Content', contentSchema)