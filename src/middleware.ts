import jwt, { JwtPayload } from "jsonwebtoken"
import { PRIVATE_KEY } from "./config"
import { Request, Response, NextFunction } from "express"

const userMiddleware = async function(req: Request, res: Response, next: NextFunction){
    const token = req.headers['authorization']

    const decodedToken = jwt.verify(token as string, PRIVATE_KEY)
    if(decodedToken){
        if(typeof decodedToken === "string"){
            res.status(403).json({
                message: 'You are not logged in'
            })
            return
        }
            req.userId = (decodedToken as JwtPayload)._id
            next()
    }
        else{
            res.status(403).json(
                {
                    message: "You are not logged in"
                }
            )
        }
}

export {
    userMiddleware
}