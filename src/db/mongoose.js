const mongoose=require("mongoose")


mongoose.connect('mongodb+srv://system:system@payzut.3x1gn.mongodb.net/payzut?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
