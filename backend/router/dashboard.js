const express = require('express');
const db = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');

router.get('/details',auth.authenticateToken,async(req,res,next)=>{
    console.log(req.body)
    console.log("hallo")
    console.log(res.locals)
    let user =res.locals.role
    
    

 let categoryCount=await db.get().collection('category').count()
 let productCount=await db.get().collection('product').count()
 let orderCount = await db.get().collection('order').count()
       console.log(categoryCount)
       var details={
           user,
           categoryCount,
           productCount,
           orderCount
       }
       console.log(details)
       res.status(200).json(details)
})
           
           
router.get('/images/:id',(req,res)=>{
    let id= req.params.id
    res.sendFile('../images/'+id+'.jpg')
})    
        
    
  /*  db.get().collection('product').count().then((productCount)=>{
        productCount=productCount
    })
        
            countDetails = {
                category:categoryCount,
                product:productCount
                }
            
            console.log(countDetails)
            
                
             /*  return  res.status(200).json({countDetails});
                
        }else{
            console.log(err)
            return res.status(500).json(err);
        }
    })*/
   /* db.get().collection('order').countDocuments({}).then((err,data)=>{
        if(!err){
            orderCount=data
            var countDetails = {
                category:categoryCount,
                product:productCount,
                order:orderCount
            };
            return res.status(200).json(countDetails);
        }else{
            return res.status(500).json(err);
        }
    }) */


module.exports = router;