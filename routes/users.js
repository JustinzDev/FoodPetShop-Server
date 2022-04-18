const express = require("express")
const router = express.Router()

const userModel = require('../models/userModel')
const userCartModel = require('../models/usercartModel')
const itemModel = require('../models/itemModel')

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
    res.status(200).send({ type: 'success', userToken: token })
})

router.post('/auth_token', async (req, res) => {
    try {
        let jwtResponse = jwt.verify(req.body.token, process.env.JWTPRIVATEKEY)
        console.log(jwtResponse)
        return res.status(200).send({ type: 'success', username: jwtResponse.username, _id: jwtResponse._id })
    } catch (err){
        return res.status(200).send({ type: 'exp' })
    }
})

router.get('/cartitems/:ownerid', async (req, res) => {
    const result = await userCartModel.find({
        itemownerid: req.params.ownerid
    })

    if(result) res.status(200).send(result)
    else console.log('not found')
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
        const removeItem = await userCartModel.remove({
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

module.exports = router