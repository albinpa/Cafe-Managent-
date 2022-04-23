const express = require('express');
const db = require('../connection');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
    let orderObj = {
        name: orderDetails.name,
        uuid: generatedUuid,
        email: orderDetails.email,
        mobile: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        total: orderDetails.totalAmount,
        productDetails: orderDetails.productDetails,
        createdBy: res.locals.email
    }

    db.get().collection('order').insertOne(orderObj).then((data) => {

        if (data) {
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, mobile: orderDetails.mobile, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount }).then((data) => {

                console.log(data)
                if (data) {
                    pdf.create(data).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
                        if (err) {
                            console.log(err)
                            return res.status(500).json(err);
                        } else {
                            console.log(data)
                            return res.status(200).json({ uuid: generatedUuid });
                        }
                    })


                } else {
                    return res.status(500).json(err);
                }
            })
        } else {
            return res.status(500).json(err);
        }
    })
})
router.post('/getPdf', auth.authenticateToken, (req, res) => {
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, mobile: orderDetails.mobile, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount }).then((data, err) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                pdf.create(data).toFile('./generated_pdf/' + orderDetails.uuid + ".pdf", function (data, err) {
                    if (err) {
                        console.log(err)
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }
        })
    }
})

router.get('/getBills', auth.authenticateToken, (req, res) => {
    let user = res.locals.email
    db.get().collection('order').find({ createdBy: user }).toArray((err, data) => {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(500).json(err);
        }
    })
})
router.delete('/delete/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    let objectIdord = new ObjectID(id);
    db.get().collection('order').removeOne({ _id: objectIdord }).then((data, err) => {

        if (!err) {
            if (data.deletedCount == 0) {
                return res.status(404).json({ message: "Order id doest found" })
            } else {
                return res.status(200).json({ message: "Order deleted successfully" })
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;
