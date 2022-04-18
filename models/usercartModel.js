const mongoose = require('mongoose')
const userCartSchema = new mongoose.Schema({
    itemownerid: { type: String, required: true },
    itemid: { type: String, required: true },
    itemname: { type: String, required: true },
    itemamount: { type: Number, required: true },
    itemtotalprice: { type: Number, required: true },
    itemimg: { type: String, required: true } 

}, { collection: 'user_carts' })

module.exports = mongoose.model("userCartSchema", userCartSchema)