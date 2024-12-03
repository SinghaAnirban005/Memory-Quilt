import jwt from "jsonwebtoken"
import { PRIVATE_KEY } from "./config"
import { Request, Response, NextFunction } from "express"

const userMiddleware = async function(req: Request, res: Response, next: NextFunction){
    const token = req.headers['authorization']

    const decodedToken = jwt.verify(token, PRIVATE_KEY)
    if(decodedToken){
        //@ts-ignore
        req.userId = decodedToken._id
        next()
    }
    else{
        res.status(403).json(
            {
                message: "You are not signed in !!"
            }
        )
    }
}

export {
    userMiddleware
}