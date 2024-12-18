import express, { urlencoded } from "express"
import jwt from "jsonwebtoken"
import { UserModel } from "./model"
import { LinkModel } from "./model"
import { ContentModel } from "./model"
import { TweetModel } from "./model"
import { YoutubeModel } from "./model"
import bcrypt from "bcrypt"
import { PRIVATE_KEY } from "./config"
import { userMiddleware } from "./middleware"
import { random } from "./utils"
import cors from "cors"
import connectDB from "./db"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"

const app = express()

connectDB()

app.use(express.json())
app.use(urlencoded())
app.use(cors({
    origin: "https://secondbrain-d98e.onrender.com",
    credentials: true
}))
app.use(cookieParser())

app.post('/api/v1/signup', async(req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await UserModel.create({
            username: username,
            password: hashedPassword
        }) 

        res.json(
            {
                message: "User signed up"
            }
        )
    } catch (error) {
        res.status(400).json(
            {
                message: error
            }
        )     
    }
    
})

app.post('/api/v1/signin', async(req, res) => {
    const { username, password } = req.body
   try {
     const existingUser = await UserModel.findOne({
         username: username
     })

     //@ts-ignore
     const isPasswordCorrect = await bcrypt.compare(password.trim(), (existingUser?.password))
     if(isPasswordCorrect){
        res.status(500).json(
            {
                message: "Incorrect Password"
            }
        )
     }
     if(existingUser){
         const token = jwt.sign({
             _id: existingUser._id
         },PRIVATE_KEY)
         
         const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
         }
         //@ts-ignore
         res.status(200).cookie('authToken', token, options).json({
             message: "User signed in succesfully"
         })
     }
   } catch (error) {
        res.status(403).json(
            {
                message: "Invalid credentials"
            }
        )
   }
})

app.post('/api/v1/content', userMiddleware, async(req, res) => {
    const {link, type, title} = req.body

    const content = await ContentModel.create({
        link, 
        type,
        title,
        tags:[],
        //@ts-ignore
        userId: req.userId
    })

    res.json(
        {
            message: "Content has been added Succesfully !!" ,
            content: content
        }
    )
})

app.get('/api/v1/content', userMiddleware, async(req, res) => {
    const contents = await ContentModel.find(
        {
            //@ts-ignore
            userId: req.userId
        }
    ).populate('userId', 'username')

    res.status(200).json(
        {
            content: contents
        }
    )
})

app.delete('/api/v1/content',userMiddleware, async(req, res) => {
    const contentId = req.body.contentId

    const content = await ContentModel.deleteOne({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message: "Deleted",
        content: content
    })
})

app.post('/api/v1/memory/share',userMiddleware, async(req, res) => {
    const share = req.body.share

    if(share){
        const existingLink = await LinkModel.find({
            //@ts-ignore
            userId: req.userId
        })
        
        if (existingLink.length !== 0) {
            res.json({
                //@ts-ignore
                hash: existingLink[0]?.hash,
                message: "Opeartion is  succesfull"
            })
            return;
        }
        const hash = random(10)
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash
        })

        res.json(
            {
                hash: hash
            }
        )
    }
    else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })

        res.json(
            {
                "message": "Removed link"
            }
        )
    }
})

app.get('/api/v1/memory/:shareLink', async(req, res) => {
    const hash = req.params.shareLink

    const link = await LinkModel.findOne({
        hash: hash
    })

    if(!link){
        res.status(403).json(
            {
                message: 'Sorry incorrect input'
            }
        )
        return
    }

    const content = await ContentModel.find({
        userId: link.userId
    })
    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }
    
    res.status(200).json(
        {
            username: user.username,
            content: content 
        }
    )
})

app.post('/api/v1/tweet',userMiddleware, async(req, res) => {
    try {
        const { url, title } = req.body
        //@ts-ignore
        const userId = req.userId

        if(!url || !title){
            res.json(
                {
                    message: "Please provide URL and title"
                }
            )
        }

        const tweet = await TweetModel.create({
            url: url,
            title: title,
            user: userId
        })

        res.status(200).json(
            {
                message: 'Tweet linked succesfully !!',
                tweet: tweet
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                message: "Server errror :: Failed to save tweet"
            }
        )
    }
})

app.get('/api/v1/tweet',userMiddleware, async(req, res) => {
    try {   
        //@ts-ignore
        const userId = req.userId
        const tweets = await TweetModel.findById({
            user: userId
        })

        res.status(200).json(
            {
                message: 'Fetched all tweets',
                tweets: tweets
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                message: "Failed to fetch tweets"
            }
        )   
    }
})

app.delete('api/v1/delete/tweet', async(req, res) => {
    const { url } = req.body

    if(!url){
        res.status(403).json(
            {
                message: "No URL found"
            }
        )
    }

    await ContentModel.findOneAndDelete({
        link: url
    })
    await TweetModel.findOneAndDelete({
        url: url
    })

    res.status(200).json(
        {
            message: "Succesfully deleted tweet !!"
        }
    )
})

app.post('/api/v1/youtube',userMiddleware, async(req, res) => {
    try {
        const { url, title } = req.body
        //@ts-ignore
        const userId = req.userId
        
        if(!url || !title){
            res.json(
                {
                    message: "Please provide URL and title"
                }
            )
        }

        const youtube = await YoutubeModel.create({
            url: url,
            title: title,
            user: userId
        })

        res.status(200).json(
            {
                message: 'Youtube linked succesfully !!',
                youtube: youtube
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                message: "Server errror :: Failed to save Youtube"
            }
        )
    }
})

app.get('/api/v1/youtube',userMiddleware, async(req, res) => {
    try {   
        //@ts-ignore
        const userId = req.userId
        const youtube = await YoutubeModel.findById({
            user: userId
        })

        res.status(200).json(
            {
                message: 'Fetched all youtube videos',
                youtube: youtube
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                message: "Failed to fetch videos"
            }
        )   
    }
})

app.delete('api/v1/delete/youtube', async(req, res) => {
    const { url } = req.body

    if(!url){
        res.status(403).json(
            {
                message: "No URL found"
            }
        )
    }

    await ContentModel.findOneAndDelete({
        link: url
    })
    await YoutubeModel.findOneAndDelete({
        url: url
    })

    res.status(200).json(
        {
            message: "Succesfully deleted Youtube !!"
        }
    )
})

app.listen(3000)

export default app