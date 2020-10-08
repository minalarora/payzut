const express=require("express")
const router=new express.Router()
const User=require("../models/user")
const auth=require("../middleware/auth")
const multer=require("multer")
const sharp=require("sharp")

const upload=multer({
     limits: {
         fileSize: 2000000
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

 router.post("/user/me/aadhaarfront",auth, upload.single('aadhaarfront'),async (req,res)=>{
     try
     {
     const buffer=await sharp(req.file.buffer).png().toBuffer()
     req.user.aadhaarfront=buffer
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

 router.post("/user/me/aadhaarback",auth, upload.single('aadhaarback'),async (req,res)=>{
    try
    {
    const buffer=await sharp(req.file.buffer).png().toBuffer()
    req.user.aadhaarback=buffer
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

router.post("/user/me/pancard",auth, upload.single('pancard'),async (req,res)=>{
    try
    {
    const buffer=await sharp(req.file.buffer).png().toBuffer()
    req.user.pancard=buffer
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

router.post("/user/me/selfie",auth, upload.single('selfie'),async (req,res)=>{
    try
    {
    const buffer=await sharp(req.file.buffer).png().toBuffer()
    req.user.selfie=buffer
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

router.get("/user/me/selfie",auth,async (req,res)=>
{
    try
    {
        if(!req.user.selfie)
        {
            return res.status(404).send("No Image")
        }
        res.set('Content-Type','image/png')
        res.send(req.user.selfie).status(200)
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
        const allowedUpdates=['password','address','city','state','pincode']
        const isValid=updates.every((update)=>{
            return allowedUpdates.includes(update)
        }) 
        if(!isValid)
        {
            return res.status(404).send("Invalid!")
        }

        const user={}
        updates.forEach((update)=>{
            req.user[update]=req.body[update]
            user[update]=  req.body[update]   
        })

        await req.user.save()

        res.send(user).status(200)
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