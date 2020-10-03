const mongoose=require("mongoose")

const transactionSchema=mongoose.Schema({
    card :
    {
       type: String,
       required: true,
       maxlength: 22,
       minlength: 16,
       trim: true 
    },
    account:
    {
        type: Number,
        required: true,
        trim: true,
    
    },
    ifsc:
    {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    amount:
    {
        type: Number,
        required: true,
        min: 100,
        max: 20000
    },
    status:
    {
        type: String,
        required: true,
        default: 'success',
        enum: ['failed','success','pending']
    },
    category:
    {
        type: String,
        required: true,
        enum: ['urgent','high','normal']
    },
    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user" 
    }
},{
    timestamps: true
})

const Transaction=mongoose.model('transaction',transactionSchema);

module.exports=Transaction

