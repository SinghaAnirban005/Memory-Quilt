import express from "express"
import jwt from "jsonwebtoken"
import connectDB from "./db"
import { userModel } from "./model"
import { contentModel } from "./model"
import bcrypt from "bcrypt"
import { PRIVATE_KEY } from "./config"
import { userMiddleware } from "./middleware"

const app = express()

app.post('/api/v1/signup', async(req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        const hashedPassword = bcrypt.hash(password, 10)
        
        const newUser = await userModel.create({
            username,
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
                message: "User already exists"
            }
        )     
    }
    
})

app.post('/api/v1/signin', async(req, res) => {
    const { username, password } = req.body

   try {
     const existingUser = await userModel.findOne({
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

    const content = await contentModel.create({
        link, 
        type,
        title,
        tags:[],
        //@ts-ignore
        userId: req.userId
    })

    res.json(
        {
            message: "Content has been added Succesfully !!"
        }
    )
})

app.get('/api/v1/content', userMiddleware, async(req, res) => {
    const contents = await contentModel.find(
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

    await contentModel.deleteMany({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})

app.post('/api/v1/memory/share', (req, res) => {

})

app.post('/api/v1/memory/:shareLink', (req, res) => {

})


app.listen(3000, async() => {
    try {
        await connectDB
        console.log('MONGO_DB connected !!')
    } catch (error) {
        console.log(error)
    }
})

export default app