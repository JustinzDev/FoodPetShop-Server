const express = require("express")
const router = express.Router()

const userModel = require('../models/userModel')
const userCartModel = require('../models/usercartModel')
const userOrderModel = require('../models/userorderModel')
const userItemKeyModel = require('../models/useritemkeyModel')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
    const { username, email, telephone, password, confirmpassword } = req.body
    const result = await userModel.findOne({
        $or: [{
            username: username
        }, {
            email: email
        }]
    })

    if(result) return res.status(200).send({ type: 'user_already' })
    let comparePassword = password.localeCompare(confirmpassword);
    if(comparePassword != 0) return res.status(200).send({ type: 'wrong_password_notmatch', message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน!" })

    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(password, salt)

    await new userModel({ ...req.body, password: hashPassword }).save()
    res.status(200).send({ type: "success", userdata: username, message: `คุณได้สร้างบัญชี ${username} สำเร็จแล้ว` })
})

router.post('/login', async (req, res) => {
    const { username, email, password } = req.body
    const user = await userModel.findOne({
        $or: [{
            username: username
        }, {
            email: username
        }]
    })

    if(!user) return res.status(200).send({ type: "wrong_username" })
    const validPassword = await bcrypt.compare(password, user.password)
    if(!validPassword) return res.status(200).send({ type: "wrong_password", message: "รหัสผ่านของคุณไม่ถูกต้อง!" })

    const token = user.generateAuthToken()
    res.status(200).send({ type: 'success', userToken: token, _id: user._id })
})

router.post('/auth_token', async (req, res) => {
    try {
        let jwtResponse = jwt.verify(req.body.token, process.env.JWTPRIVATEKEY)
        console.log(jwtResponse)
        return res.status(200).send(jwtResponse)
    } catch (err){
        return res.status(200).send("Token Exp")
    }
})

router.post('/get_profiledata', async (req, res) => {
    const { _id } = req.body
    const result = await userModel.findOne({
        _id: _id
    })
    
    if(result) return res.status(200).send(result)
    else return res.status(200).send({ type: 'fail' })
})

router.post('/update_profile', async (req, res) => {
    const { _id, telephone, firstname, lastname, address } = req.body
    const result = await userModel.findOneAndUpdate(
        { _id: _id },
        { 
            telephone: telephone, 
            firstname: firstname,
            lastname: lastname,
            address: address
        }
    )

    if(result) return res.status(200).send({ type: 'success' })
    else return res.status(200).send({ type: 'wrong' })
})

router.get('/cartitems/:ownerid', async (req, res) => {
    const result = await userCartModel.find({
        itemownerid: req.params.ownerid
    })

    if(result) res.status(200).send(result)
    else console.log('not found')
})

router.post('/createorderitem', async (req, res) => {
    const { carid, itemid, itemamount, itemtotalprice, itemownerid, itemname, itemimg, itemkey } = req.body
    const createorder = await userOrderModel.create({
        itemownerid: itemownerid,
        itemid: itemid,
        itemname: itemname,
        itemamount: itemamount,
        itemtotalprice: itemtotalprice,
        itemkey: itemkey,
        itemimg: itemimg
    })

    if(createorder) {
        const removeallcart = await userCartModel.findByIdAndDelete(
            { _id: carid }
        )
        if(removeallcart) return res.status(200).send({ type: 'success' })
        else return res.status(200).send('Wrong!')
    }
    else return res.status(200).send('Wrong!')
})

router.post('/additemcart', async (req, res) => {
    const { itemid, itemownerid, itemname, itemamount, itemtotalprice, itemimg } = req.body

    const research = await userCartModel.findOne({
        itemownerid: itemownerid,
        itemid: itemid
    })

    if(research){
        return res.status(200).send({ type: 'item_exist' })
    } else {
        const result = await userCartModel.create({
            itemownerid: itemownerid,
            itemid: itemid,
            itemname: itemname,
            itemamount: itemamount,
            itemtotalprice: itemtotalprice,
            itemimg: itemimg
        })
    
        if(result) {
            return res.status(200).send({ type: 'success' })
        }
        else console.log('fail')
    }
})

router.post('/updateitemcard', async (req, res) => {
    const { _id, itemamount } = req.body

    const findItem = await userCartModel.findOne({
        _id: _id
    })

    if(findItem){
        const result = await userCartModel.findOneAndUpdate(
            { _id: findItem._id },
            { itemamount: itemamount }
        )
        if(result){
            return res.status(200).send({ type: 'success', message: `คุณได้อัพเดทจำนวนสินค้า '${result.itemname}' เป็น '${itemamount}' เรียบร้อยแล้ว` })
        } else return res.status(200).send('Can not Update Item')
    } else return res.status(200).send('Not Found Item')
})

router.post('/deleteitemcard', async (req, res) => {
    const { _id } = req.body

    const findItem = await userCartModel.findOne({
        _id: _id
    })
    
    if(findItem){
        const removeItem = await userCartModel.deleteOne({
            _id: _id
        })
        
        if(removeItem) return res.status(200).send({ type: 'success', message: `คุณได้ทำการลบสินค้า '${findItem.itemname}' ออกจากตะกร้าเรียบร้อยแล้ว` }) 
        else return res.status(200).send('Can not Delete Item')
    } else return res.status(200).send('Not Found Item')
})

router.get('/getitemcart/:_id', async (req, res) => {
    const result = await userCartModel.findOne({
        _id: req.params._id
    })

    if(result) return res.status(200).send(result)
})

router.post('/createkeyorderlist', async (req, res) => {
    const { itemownerid, itemkey, itemtotalprice, itemstate, itempayment, itemcount, itemimgpreview } = req.body
    const result = await userItemKeyModel.create({
        itemownerid: itemownerid,
        itemkey: itemkey,
        itemtotalprice: itemtotalprice,
        itemstate: itemstate,
        itempayment: itempayment,
        itemcount: itemcount,
        itemimgpreview: itemimgpreview
    })

    if(result) return res.status(200).send({ type: 'success' })
    else return res.status(200).send({ type: 'wrong' })
})

router.get('/myorderkeylist/:_id', async (req, res) => {
    const result = await userItemKeyModel.find(
        { itemownerid: req.params._id }
    )
    console.log(result)
    if(result) return res.status(200).send(result)
    else return res.status(200).send('Wrong!')
})

router.get('/myorderlist/:_ownerid/:_itemkey', async (req, res) => {
    const result = await userOrderModel.find(
        { 
            itemownerid: req.params._ownerid,
            itemkey: req.params._itemkey
        }
    )
    if(result) res.status(200).send(result)
    else return res.status(200).send('Wrong!')
})

router.get('/getusername/:_id', async (req, res) => {
    const result = await userModel.findOne({
        _id: req.params._id
    })
    if(result) return res.status(200).send({ username: result.username })
})

module.exports = router