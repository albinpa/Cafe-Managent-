const express = require('express');
const fileUpload = require('express-fileupload');
const ReplSet = require('mongodb/lib/topologies/replset');
const { path } = require('..');
const db =require('../connection');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID
var auth=require('../services/authentication');
var checkRole = require('../services/checkrole');
const { route } = require('./user');


router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let product= req.body
    let catId=req.body.categoryId
    let objectIdcat= new ObjectID(catId)
    let proObj={
        name:product.name,
        categoryId:objectIdcat,
        description:product.description,
        price:parseInt(product.price),
        status:"false"
    }
    
    db.get().collection('product').insertOne(proObj).then((data,error)=>{
        if(data){
            
            return res.status(200).json({message:"Product inserted successfully"})
        }else{
            return res.status(500).json(err)
        }
    })
})
router.get('/get',auth.authenticateToken,(req,res)=>{
    db.get().collection('product').aggregate({
        $lookup:{
            from:"category",
            localField:"categoryId",
            foreignField:"_id",
            as:"category"

        }
        },
        {
            $project:{
                name:1,description:1,price:1,status:1,category:{$arrayElemAt:['$category',0]}
            }
        },{
            $unwind:'$category'
        }
        ).toArray((error,data)=>{
        if(!error){
           return res.status(200).json(data)
        }else{
           return res.status(500).json(error)
        }
    })
})
router.get('/getByCategory/:id',auth.authenticateToken,(req,res)=>{

    var catId=req.params.id
    console.log(catId)
    let objectIdcat=new ObjectID(catId)
    db.get().collection('product').find({categoryId:objectIdcat,status:"true"}).toArray((error,data)=>{
        console.log(catId)
        if(data){
           return res.status(200).json(data)
        }else{
           return res.status(500).json(error)
        }
    })

})
router.get('/getById/:id',auth.authenticateToken,(req,res)=>{
    let proId=req.params.id
    let objectIdpro=new ObjectID(proId)
    db.get().collection('product').findOne({_id:objectIdpro}).then((data,error)=>{
        if(data){
           return res.status(200).json(data)
        }else{
           return res.status(500).json(err)
        }
    })
})
router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let product= req.body
    let proId=product.id
    let catId=product.categoryId
    let objectIdpro=new ObjectID(proId)
    let objectIdcat=new ObjectID(catId)
    db.get().collection('product').updateOne({_id:objectIdpro},{
        $set:{
            name:product.name,
        categoryId:objectIdcat,
        description:product.description,
        price:parseInt(product.price),
        status:"true"
        }
    }).then((data,error)=>{
        if(data){
            if(data.nModified == 0){
               return res.status(404).json({message:"Product id not found"})
            }else{
               return res.status(200).json({message:"Product updated successfully"})
            }
        }else{
           return res.status(500).json(err)
        }
    })
})
router.delete('/delete/:id',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let proId=req.params.id
    let objectIdpro=new ObjectID(proId)

    db.get().collection('product').removeOne({_id:objectIdpro}).then((data,error)=>{
        if(data){
            if(data.nRemoved == 0){
               return res.status(404).json({message:"Product id not found"})
            }else{
               return res.status(200).json({message:"Product deleted successfully"})
            }
        }else{
           return res.status(500).json(err)
        }
    })
})
router.patch('/updateStatus',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let product= req.body
    let proId=product.id
    let objectIdpro=new ObjectID(proId)
    db.get().collection('product').updateOne({_id:objectIdpro},{
        $set:{
           
        status:product.status
        }
    }).then((data,error)=>{
        if(data){
            if(data.modifiedCount == 0){
               return res.status(404).json({message:"Product id not found"})
            }else{
               return res.status(200).json({message:"Product updated successfully"})
            }
        }else{
           return res.status(500).json(err)
        }
    })
})
router.post('/image/:id',(req,res)=>{
    let id = req.params.id
    console.log(id)
    let file = req['files'].thumbnail;
    console.log(file)
    
    file.mv('./images/'+id+'.jpg',(err,data)=>{
        if(!err){
            return res.status(200).json({message:"Image added successfully"})
        }else{
            return res.status(500)
        }
    })

})


module.exports = router;
