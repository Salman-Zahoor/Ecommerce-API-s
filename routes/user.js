const Otp=require("../model/otp")
const User = require("../model/user")
const nodemailer = require("nodemailer")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const express = require("express")
const router= express.Router()

let JWTSECRET="jskjjekmhdwnu291202iiwi93kw9u2"

///Login Api
router.post("/login",async(req,res)=>{
 const {email,password}=req.body
 let result=await User.findOne({email})
 if (result==null){
     res.status().send({
         error:"Error",
         message:"User does not exist"
    })   
 }else{
     console.log(result.password,"PaSSWORD");
     if(await bcrypt.compare(password,result.password)){
         let token=jwt.sign({id:result._id,name : result.username},JWTSECRET)
         if (result.status != "Active") {
             res.status(400).send({
                 status:"Error",
                 message:"Your Account is temporary suspended please conatact support"
             })
         } else {
             result.password=null
             let params={
                 result,
                 token
             }
             res.status(200).send({
                 status:"OK",
                 data:params
             })
         }
     }
     else{
        res.status(400).send({
            status: "ok",
            message: "Email Or Password is Incorrect"
        })
     }
}
})

                // User Register Api ///
router.post("/register",async(req,res)=>{
    const { username, password, email, image, code,fcm } = req.body
    if (!username || !password || !email || !image ) {
        res.status(400).send({
            status:"error",
            message:"please enter complete information"
        })
    } else {
        let pass=await bcrypt.hash(password,5)
        console.log(email,code,"values");
        let otp = await Otp.findOne({ email, otp: code })
        if (otp) {
            let currentTime=new Date().getTime()
            let remainingTime=otp.expressIn - currentTime
            if (remainingTime < 0) {
                res.status(400).send({
                    status:"error",
                    message:"Otp has expired"
                })
            } else {
                try {
                    let result= await User.create({
                        username,
                        password:pass,
                        email,
                        image,
                        fcm
                    })
                    res.status(200).send({
                        status:"success",
                        message:"User Created Successfully"
                    })    
                } catch (error) {
                    if(error.code==1000){
                        res.status(400).send({
                            status:"Error",
                            message:"Email Already Exist"
                        })
                    }
                    else{
                        res.status(400).send({
                            status: "error",
                            message: "Something went wrong"
                        })
                    }
                }
                
            }
        } else {
            res.status(400).send({
                status: "error",
                message: "Otp is invalid"
            })
        }  
    }
})


                //SEND OTP CODE 
router.post("/sendCode",async(req,res)=>{
    const {email}=req.body
    console.log("Email");
    try {
        let otp=Math.floor(1000 + Math.random() * 9000)
        var mail = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sahmeddayo@gmail.com",
                pass: "mhuvlzmiltydqmth"
            },
            tls: {
                rejectUnauthorized: false
            }
        })
        let mailOption={
            from:"noreply@gmail.com",
            to:email,
            subject:"User Verification",
            text:`Your Verification Code is ${otp}`
        }
        console.log(mailOption,"Mail Option");
        let result= await Otp.create({
            email,
            otp,
            expiresIn : new Date().getTime() +300 * 1000
        })

        mail.sendMail(mailOption,(err,response)=>{
            if (err) {
                console.log(err,"Error");
                res.send({
                    status:"error",
                    message:"Something Went Wrong"
                })
            }else{
                console.log("Api Called");
                res.send({
                    status:"Success",
                    meseege:"Verification Code has been sent to your email address"
                })
            }
        })
    } catch (error) {
        console.log(error,"Error");
    }
})


/// Forget Code 
router.post("/forgetpassword",async(req,res)=>{
    const {email,password}=req.body

    let result=User.findOne({email})
    if (result) {
        let hashedPass= await bcrypt.hash(password, 10)
        let updateUser= await User.updateOne({_id : result._id},{$set: {password :hashedPass}})
        res.status(200).send({status:"OK",message:"Updated Successfully"})
    } else {
        res.status(400).send({status:"error",message:"Email not Found"})
    }
})

router.post('/updateProfile', async (req, res) => {
    const { email } = req.body
    let result = await User.findOne({ email })
    if (result) {
        let updatedUser = await User.findOneAndUpdate({ _id: result._id }, req.body, { new: true })
        res.send({
            status: "ok",
            data: updatedUser
        })
    }
    else {
        res.status(400).send({ status: "error", message: "Something went wrong" })
    }
})

router.post("/changePassword", async (req, res) => {
    const { password, email,newPassword } = req.body
    let result = await User.findOne({ email })
    if (result) {
        if (await bcrypt.compare(password, result.password)) {
            // console.log("password matched");
            let hashedPassword = await bcrypt.hash(newPassword, 10)
            let updateUser = await User.updateOne({ _id: result._id }, { $set: { password: hashedPassword } })
            res.status(200).send({ status: "ok", message: "Updated Successfully" })
           
        }
        else {
            res.status(400).send({
                status: "ok",
                message: "Current Password is Invalid"
            })
        }
    }
    else {
        res.status(400).send({
         status:"Error",
         message:"Email & Password not found"
        })
    }

})





module.exports=router