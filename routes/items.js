const express = require("express")
const router = express.Router()
const itemModel = require('../models/itemModel')

router.get('/getitems', async (req, res) => {
    const result = await itemModel.find()
    res.status(200).send(result)
})

router.get('/getitems/:model', async (req, res) => {
    const result = await itemModel.find({
        itemcategory: req.params.model
    })
    if(result){
        res.status(200).send(result)
    }
})

router.get('/getitem/:_id', async (req, res) => {
    const result = await itemModel.findOne({
        _id: req.params._id
    })

    if(result) res.status(200).send(result)
    else console.log('not found')
})

module.exports = router