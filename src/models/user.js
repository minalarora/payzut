const validator=require("validator")
const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const Transaction=require("./transaction")

const userSchema=mongoose.Schema({
  name:{
      type:String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: [30,"INVALID USER NAME"]
  },
  address:
  {
    type:String,
    maxlength:[50,"INVALID ADDRESS"],
    trim:true
  },
  city:
  {
      type: String,
      maxlength:[20,"INVALID CITY"],
      trim: true,
  },
  state:
  {
    type: String,
    maxlength:[20,"INVALID STATE"],
    trim: true 
  },
  pincode:
  {
    type: Number,
    minlength: [6,"INVALID PINCODE"]
  },
  email:
  {
    type:String,
    required: true,
    trim: true,
    unique:true,
    maxlength:25,
    validate(value)
    {
        if(!validator.isEmail(value))
        {
            throw new Error("INVALID EMAIL")
        }
    }
  },
  password:
  {
    type:String,
    required: true,
    minlength: 6
  },
  mobile:
  {
    type: String,
    required: true,
    unique: true,
    minlength: [10,'INVALID MOBILE'],
    validate(value)
    {
        if(!validator.isMobilePhone(value))
        {
            throw new Error("INVALID MOBILE") 
        }
    }
  },
  accountstatus:
  {
      type: Boolean,
      required: true,
      default: false 
  },
  aadhaarfront:
  {
    type: Buffer
  },
  aadhaarback:
  {
    type: Buffer
  },
  pancard:
  {
    type: Buffer
  },
  selfie:
  {
    type: Buffer
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
})

userSchema.statics.findByCredentials=async (email,password)=>{
  const user=await User.findOne({email})
  if(!user)
  {
    throw new Error("user not found")
  }
  const isMatch=await bcrypt.compare(password,user.password)
  if(!isMatch)
  {
    throw new Error("password mismatch")
  }
  return user
}

userSchema.methods.generateAuthToken= async function()
{
  const user=this
  const token=jwt.sign({_id:user._id.toString()},'minalarora')
  user.tokens=user.tokens.concat({token})
  await user.save()
  return token
}

userSchema.virtual('transactions',{
  ref: 'transaction',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.pre('save',async function(next){
  const user=this
  if(user.isModified('password'))
  {
    user.password=await bcrypt.hash(user.password,8)
  }
  next()
})


userSchema.pre('remove',async function(next){
  const user=this
  await Transaction.deleteMany({owner:user._id})
  next()
})

const User=mongoose.model('user',userSchema)

module.exports=User