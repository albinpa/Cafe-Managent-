require('dotenv').config()
const { response } = require('express');
const jwt =require('jsonwebtoken')

function authenticateToken(req,res,next){
   const authHeader = req.headers['authorization']
   console.log(authHeader)
   const token = authHeader && authHeader.substring(6,authHeader.length)
   if(token == null)
   return res.sendStatus(401);
   

   jwt.verify(token,process.env.ACCESS_TOKEN,(err,response)=>{
       if(err)
       return res.sendStatus(403);
       
       res.locals=response;
      
      
       next();
      
   })

}

module.exports= {authenticateToken: authenticateToken}