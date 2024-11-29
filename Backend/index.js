import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import connectDB from "./utils/db.js"
dotenv.config({})
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import messageRoute from "./routes/message.route.js"
import { app, server } from "./socket/socket.js"


const PORT=process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended:true}))

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use(cors(corsOptions));

app.get("/api/v2/", (req, res)=>{
    res.status(200).json({
        message: "i am from backend",
        success: true
    })
    // res.send("hey")
})

app.use("/api/v2/user", userRoute)
app.use("/api/v2/post", postRoute)
app.use("/api/v2/message", messageRoute)

server.listen(PORT,()=>{
    connectDB();
    console.log(`server listen at port ${PORT}`)
})