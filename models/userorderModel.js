const mongoose = require('mongoose')

const userOrderSchema = new mongoose.Schema({
    itemownerid: { type: String, required: true },
    itemname: { type: String, required: true },
    itemid: { type: String, required: true },
    itemamount: { type: Number, required: true },
    itemtotalprice: { type: Number, required: true },
    itemkey: { type: String, required: true },
    itemimg: { type: String, required: true }

}, { collection: 'user_orders' })

module.exports = mongoose.model("userOrderSchema", userOrderSchema)