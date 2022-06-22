const express = require("express")
const { findOneAndDelete } = require("../models/itemModel")
const router = express.Router()
const itemModel = require('../models/itemModel')
const useritemkeyModel = require("../models/useritemkeyModel")
const userorderModel = require("../models/userorderModel")
const orderModel = require('../models/userorderModel')

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

router.post('/edititem', async (req, res) => {
    const { itemid, itemname, itemamount, itemprice, itemcategory, itemdetail } = req.body
    
    const update = await itemModel.findOneAndUpdate(
        { _id: itemid },
        {
            itemname: itemname,
            itemamount: itemamount,
            itemprice: itemprice,
            itemcategory: itemcategory,
            itemdetail: itemdetail
        }
    )

    if(update) {
        console.log("pass")
        return res.status(200).send({ message: `คุณได้ทำการอัพเดท '${update.itemname}' เรียบร้อยแล้ว` })
    }
    else {
        console.log("null")
        return res.status(200).send({ message: `null` })
    }
})

router.get('/deleteitem/:_id', async (req, res) => {
    const result = await itemModel.findByIdAndDelete(
        { _id: req.params._id }
    )
    if(result) return res.status(200).send({ message: `คุณได้ทำการลบไอเท็ม ${result.itemname} ออกจากคลังเรียบร้อยแล้ว` })
    else return res.status(200).send({ message: null })
})

router.get('/getallorderlist', async (req, res) => {
    const result = await useritemkeyModel.find()
    return res.status(200).send(result)
})

router.get('/manageorderlist/:_itemkey', async (req, res) => {
    const result = await orderModel.find(
        { itemkey: req.params._itemkey }
    )
    return res.status(200).send(result)
})

router.get('/updatestate/:_itemkey', async (req, res) => {
    const result = await useritemkeyModel.find(
        { itemkey: req.params._itemkey }
    )
    return res.status(200).send(result)
})

router.post('/managestatethisorder', async (req, res) => {
    const getOrderKey = await useritemkeyModel.findOne({
        itemkey: req.body.itemkey,
        itemownerid: req.body.itemownerid
    })

    if(getOrderKey){
        const getOrderItem = await orderModel.find({
            itemkey: getOrderKey.itemkey
        })
        
        if(getOrderItem){
            if(getOrderKey.itemstate === 'wait'){
                for(let i=0; i<getOrderItem.length; i++){
                    const findItem = await itemModel.findOne(
                        { _id: getOrderItem[i].itemid }
                    )

                    if(findItem){
                        console.log(findItem)
                        if(findItem.itemamount < getOrderItem[i].itemamount) return res.status(200).send({ message: `จำนวนไอเท็ม ${findItem.itemname} ในคลังมีไม่เพียงพอกับที่ลูกค้าต้องการ` })
                        else continue
                    }
                }

                for(let i=0; i<getOrderItem.length; i++){
                    const findItem = await itemModel.findOne(
                        { _id: getOrderItem[i].itemid }
                    )
                    if(findItem){
                        console.log(findItem)
                        let newAmount = findItem.itemamount - getOrderItem[i].itemamount
                        console.log(newAmount)
                        const updateItem = await itemModel.findOneAndUpdate(
                            { _id: findItem._id },
                            {
                                itemamount: newAmount
                            }
                        )

                        if(updateItem){
                            const updateState = await useritemkeyModel.findOneAndUpdate(
                                { itemkey: getOrderKey.itemkey },
                                { itemstate: 'process' }
                            )
                            
                            if(updateState) return res.status(200).send({ message: `คุณได้อัพเดทสถานะ OrderID: '${updateState.itemkey}' เป็น 'กำลังจัดส่ง' เรียบร้อยแล้ว` })
                            else return res.status(200).send({ message: null })
                        }
                    }
                }
            }
            else if(getOrderKey.itemstate === 'process'){
                const updateState = await useritemkeyModel.findOneAndUpdate(
                    { itemkey: getOrderKey.itemkey },
                    { itemstate: 'finish' }
                )
                
                if(updateState) return res.status(200).send({ message: `คุณได้อัพเดทสถานะ OrderID: '${updateState.itemkey}' เป็น 'จัดส่งสำเร็จ' เรียบร้อยแล้ว` })
                else return res.status(200).send({ message: null })
            }
            else if(getOrderKey.itemstate === 'finish'){
                console.log('test')
            }
        }
    }
})

router.post('/deletethisorder', async (req, res) => {
    const deleteitemorder = await userorderModel.deleteMany({
        itemownerid: req.body.itemownerid,
        itemkey: req.body.itemkey
    })

    if(deleteitemorder){
        const deleteitemkey = await useritemkeyModel.findOneAndDelete(
            { itemkey: req.body.itemkey }
        )

        if(deleteitemkey) return res.status(200).send({ message: `remove ${deleteitemkey.itemkey}` })
        else return res.status(200).send({ message: null })
    }
})

router.get('/updateorderstate/:_itemkey', async (req, res) => {
    console.log(req.params._itemkey)
    const result = useritemkeyModel.findOne({
        itemkey: req.params._itemkey
    })

    if(result) return res.status(200).send(result)
})

router.post('/additemstorage', async (req, res) => {
    const { itemname, itemamount, itemprice, itemcategory, itemdetail } = req.body
    console.log(req.body)
    let popularrandom = Math.floor(Math.random() * 6)
    const insert = await itemModel.create({
        itemname: itemname,
        itemamount: itemamount,
        itemprice: itemprice,
        itemcategory: itemcategory,
        itemdetail: itemdetail,
        itemselled: 0,
        itempopular: popularrandom,
        itemimg: null
    })
    
    if(insert) {
        await itemModel.findOneAndUpdate(
            { _id: insert._id },
            { itemimg: itemcategory + '/' + insert._id + '.png' }
        )
        return res.status(200).send({ message: insert._id })
    }
    else return res.status(200).send({ message: null })
})

module.exports = router