const express = require('express');
const ReplSet = require('mongodb/lib/topologies/replset');
const db =require('../connection');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID
var auth=require('../services/authentication');
var checkRole = require('../services/checkrole');

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let category = req.body
    let catObj={
        name:category.name
    }
    db.get().collection('category').insertOne(catObj).then((data,error)=>{
        if(!error){
            return res.status(200).json({message:"Category added successfully"})
        }else{
            return res.status(500).json(err)
        }
    })
})
router.get('/get',auth.authenticateToken,async(req,res)=>{
  let category =await db.get().collection('category').find().toArray()

     return res.status(200).json(category)
},(error)=>{
    console.log(error)
})


    
router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let product=req.body
    let proId = product.id
    let objectIdpro= new ObjectID(proId)
    db.get().collection('category').updateOne({_id:objectIdpro},{
        $set:{name:product.name}
    }).then((data,error)=>{
        console.log(error)
        if(data){
            if(data.nModified == 0){
                return res.status(400).json({message:"something went wrong"})
            }else{
                return res.status(200).json({message:"category updated successfully"})
            }

        }else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router;