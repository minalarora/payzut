const express=require("express")
const router=new express.Router()
const User=require("../models/user")
const auth=require("../middleware/auth")
const multer=require("multer")
const sharp=require("sharp")

const upload=multer({
     limits: {
         fileSize: 5000000
     },
     fileFilter(req,file,cb)
     {
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
         {
             return cb(new Error("only images"))
         }
         cb(undefined,true)
     }
 })

 router.post("/user/me/image",auth, upload.single('image'),async (req,res)=>{
     try
     {
     const buffer=await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
     req.user.image=buffer
     await req.user.save()
     res.status(200).send("Uploaded!")
     }
     catch(e)
     {
        res.status(500).send(e)
     }
 },(error,req,res,next)=>{
     res.status(400).send({error:error.message})
 })

 router.delete("/user/me/image",auth,async (req,res)=>{
    try
    {
        req.user.image=undefined
        await req.user.save()
        res.status(200).send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

router.get("/user/me/image",auth,async (req,res)=>
{
    try
    {
        if(!req.user.image)
        {
            return res.status(404).send("No Image")
        }
        res.set('Content-Type','image/png')
        res.send(req.user.image).status(200)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

router.post('/user',async (req,res)=>{
    try
    {
        const user= new User(req.body)
        await user.save()
        const token=await user.generateAuthToken()
        res.status(200).send({user,token})
     
    }
    catch(e)
    {
        res.status(500).send(e.message)
    }
})

router.post('/user/login',async (req,res)=>
{
    try
    {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    }
    catch(error)
    {
        res.status(400).send(error)
    }
})

router.post('/user/logout',auth,async (req,res)=>
{
    try
    {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        await req.user.save()
        res.status(200).send("Logout successfully!!!")
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

router.post("/user/logoutall",auth,async (req,res)=>{
    try
    {
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send("Logout from all other devices!")
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

router.get('/user/me',auth,async (req,res)=>{
    try
    {
        res.send(req.user).status(200)
    }
    catch(error)
    {
        res.send("server error").status(500)
    }
})

router.patch("/user/me",auth,async(req,res)=>{
    try
    {
        const updates=Object.keys(req.body)
        const allowedUpdates=['accountstatus','mobile','email','password','address','city','state','gender']
        const isValid=updates.every((update)=>{
            return allowedUpdates.includes(update)
        }) 
        if(!isValid)
        {
            return res.status(404).send("Invalid!")
        }

        updates.forEach((update)=>{
            req.user[update]=req.body[update]
        })

        await req.user.save()

        res.send(req.user).status(200)
    }
    catch(error)
    {
        res.send("server error").status(500)
    }
})

router.delete("/user/me",auth,async (req,res)=>{
    try
    {
        const user=await User.findByIdAndDelete(req.user._id)
        await req.user.remove()
        res.status(200).send(user)
    }
    catch(error)
    {
        res.send("server error").status(500)
    }
})

module.exports=router