import express, { urlencoded } from "express"
import jwt from "jsonwebtoken"
import { UserModel } from "./model"
import { LinkModel } from "./model"
import { ContentModel } from "./model"
import bcrypt from "bcrypt"
import { PRIVATE_KEY } from "./config"
import { userMiddleware } from "./middleware"
import { random } from "./utils"
import cors from "cors"
import connectDB from "./db"
import mongoose from "mongoose"

const app = express()

connectDB()

app.use(express.json())
app.use(urlencoded())
app.use(cors())

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
    const { username } = req.body
   try {
     const existingUser = await UserModel.findOne({
         username: username
     })
     if(existingUser){
         const token = jwt.sign({
             _id: existingUser._id
         },PRIVATE_KEY)
         
         res.json({
             token: token,
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

    await ContentModel.deleteMany({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})

app.post('/api/v1/memory/share',userMiddleware, async(req, res) => {
    const share = req.body.share

    if(share){
        const existingLink = await LinkModel.find({
            //@ts-ignore
            userId: new mongoose.Types.ObjectId(req.userId)
        })
        
        if (existingLink) {
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


app.listen(3000)

export default app