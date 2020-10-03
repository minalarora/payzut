const express=require("express")
const router=new express.Router()
const Transaction=require("../models/transaction")
const auth=require("../middleware/auth")

router.post('/transaction',auth,async(req,res)=>{
    try
    {
        const transaction=new Transaction({...req.body,owner:req.user._id})
        await transaction.save()
        res.status(200).send(transaction)
    }
    catch(error)
    {
        res.status(500).send(error)
    }
})



router.get('/transaction',auth,async (req,res)=>{
    try
    {
        if(!req.query.category)
        {
        await req.user.populate({
            path : 'transactions',
            options:
            {
                limit:20,
                sort: { createdAt : -1}
            }
        }).execPopulate()
        }
        else
        {
            await req.user.populate({
                path : 'transactions',
                match: {
                    category : req.query.category
                },
                options:
                {
                    limit:20,
                    sort: { createdAt : -1}
                }
            }).execPopulate()
        }
        if( JSON.stringify(req.user.transactions) == JSON.stringify([]))
        {
            return res.status(404)
        }
        res.send(req.user.transactions).status(200)
    }
    catch(error)
    {
        res.status(500).send(error)
    }
})

router.get('/transaction/:id',auth,async (req,res)=>{
    try
    {
        const _id=req.params.id
        const transaction=await Transaction.findById({_id,owner:req.user._id})
        if(!transaction)
        {
            return  res.send("transaction not found").status(404)
        }
        
        res.send(transaction).status(200)
        
    }
    catch(error)
    {
        res.status(500).send(error)
    }
})

router.patch("/transaction/:id",auth,async(req,res)=>{
    try
    {
        const updates=Object.keys(req.body)
        const allowedUpdates=['enddate','status']
        const isValid=updates.every((update)=>{
            return allowedUpdates.includes(update)
        }) 
        if(!isValid)
        {
            return res.status(404).send("Invalid!")
        }
        const transaction=await Transaction.findOne({_id:req.params.id,owner:req.user._id})
        if(!transaction)
        {
            return res.send("transaction not found").status(404)
        }
        updates.forEach((update)=>{
            transaction[update]=req.body[update]
        })
        await transaction.save()
        res.send(transaction).status(200)
    }
    catch(error)
    {
        res.send("server error").status(500)
    }
})

module.exports=router