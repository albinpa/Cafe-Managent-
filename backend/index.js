const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRouter= require('./router/user');
const categoryRouter = require('./router/category');
const productRouter = require('./router/product');
const billRouter = require('./router/bill');
const dashRouter = require('./router/dashboard');
const fileUpload = require('express-fileupload')
const app = express();


app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(fileUpload());

app.use('/user',userRouter);
app.use('/category',categoryRouter);
app.use('/product',productRouter);
app.use('/bill',billRouter);
app.use('/dashboard',dashRouter);




module.exports = app;