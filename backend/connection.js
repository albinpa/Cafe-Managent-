const MongoClient = require('mongodb');
require('dotenv').config();
const url='mongodb://localhost:27017';
const dbname="cafe";
const state={
    db:null
}
MongoClient.connect(url, (err,data)=>{
    if(!err){
        console.log("database connected");
        state.db=data.db(dbname)
    }
        else
        console.log("error"+err);
    
});

module.exports.get=function(){
    return state.db ;
};