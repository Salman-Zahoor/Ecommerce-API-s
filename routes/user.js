const Otp=require("../model/otp")
const User = require("../model/user")
const nodemailer = require("nodemailer")
const bcrypt = require("bcryptjs")
const express = require("express")
const router= express.Router()

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

module.exports=router