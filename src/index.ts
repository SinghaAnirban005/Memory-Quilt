import express from "express"
import jwt from "jsonwebtoken"
import connectDB from "./db"

const app = express()

app.post('/api/v1/signup', (req, res) => {

})

app.post('/api/v1/signin', (req, res) => {

})

app.post('/api/v1/content', (req, res) => {

})

app.get('/api/v1/content', (req, res) => {

})

app.post('/api/v1/link', (req, res) => {

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