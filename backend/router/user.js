const express = require('express');
const db =require('../connection');
const router = express.Router();

const bcrypt=require('bcrypt');
const jwt =require('jsonwebtoken');
const nodemailer =require ('nodemailer');
var auth=require('../services/authentication');
var checkRole = require('../services/checkrole');
require('dotenv').config();


router.post('/signup',async(req,res)=>{
    let userData=req.body
    
    let user=await db.get().collection('user').findOne({email:userData.email});
    if(user){
        res.status(400).json({message:"Email already exists.."});

    }else{
    userData.password=await bcrypt.hash(userData.password,10);
    let userObj={
        name:userData.name,
        mobile:userData.mobile,
        email:userData.email,
        password:userData.password,
        role:"user",
        status:"true"
    }

    db.get().collection('user').insertOne(userObj);
    res.status(200).json({message:"Account created successfully"});
  }
});
router.post('/login',async(req,res)=>{
    let userData=req.body
    let user=await db.get().collection('user').findOne({email:userData.email})

    if(user){
        bcrypt.compare(userData.password,user.password).then((status)=>{
            if(status){
                const response={email:user.email,role:user.role}
                console.log(response)
                const accessToken=jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                res.status(200).json({token:accessToken});
                console.log(accessToken)
            }else{
                return res.status(401).json({message:"Incorrect password"})
            }
            });
    }else{
        return res.status(500).json({message:"Incorrect Username or password"})
    }
})



router.post('/forget-password',async(req,res)=>{
        let userData=req.body

        let user=await db.get().collection('user').findOne({email:userData.email})
        if(user){
             transporter=nodemailer.createTransport({
                service:'Gmail',
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.PASSWORD
                }
            });
            var mailoptions ={
                from:process.env.EMAIL,
                to:user.email,
                subject:'change password',
                text:'<p><b>Hi,'+user.name+'</b></p><br><a href="/change-password">click here to change password</a>'
            };
            transporter.sendMail(mailoptions,(error,info)=>{
                if(error){
                    console.log(error)
                    return res.status(400).json({message:"Try again later..."})
                }else{
                    console.log("msg send"+info.response)
                    res.status(200).json({message:"login link send to your email"})
                }
            });
        }else{
            res.status(400).json({message:"Invalid email"})
        }
});

router.get('/get',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let user= db.get().collection('user').find({role:"user"})
    if(!err){
        return res.status(200).json(user)
    }else{
        return res.status(500).json(err)
    }
})
router.get('/checkToken',auth.authenticateToken,(req,res)=>{
    res.status(200).json({message:"true"})
})
router.post('/changePassword',async( req, res)=>{
    let userData=req.body
    let user=await db.get().collection('user').findOne({email:userData.email})
    if(user){
        userData.password=await bcrypt.hash(userData.newpassword,10);
        db.get().collection('user').updateOne({email:userData.email},{
            $set:{password:userData.password}
        })
         return res.status(200).json({message:"Password changed successfully"})
          
        }else{
           return res.status(400).json({err})
        }
});
module.exports = router;
