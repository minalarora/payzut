require("./db/mongoose")
const User=require("./models/user.js")
const Transaction=require("./models/transaction.js")
const userRouter=require("./routers/user")
const transactionRouter=require("./routers/transaction")
const express=require("express")
const app=express()
const port= process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(transactionRouter)

app.listen(port,()=>{
    console.log("server is up on port",port)
})