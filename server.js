const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const UserApi=require("./routes/user")

mongoose.connect("mongodb://localhost:27017/Ecommerce-Backend",{
    
}).then(res=>{
    console.log(res,"Connected To local DB")
}).catch(err=>{
    console.log(err,"Error");
})

const app =express()
app.use(bodyParser.json())

let PORT = 5000

app.use('/api',UserApi)

app.listen(PORT,(req,res)=>{
    console.log(`Listening to ${PORT}`)
})