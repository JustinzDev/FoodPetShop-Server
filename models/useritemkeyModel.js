const mongoose = require('mongoose')
const userItemKeySchema = new mongoose.Schema({
    itemownerid: { type: String, required: true },
    itemkey: { type: String, required: true },
    itemtotalprice: { type: Number, required: true },
    itemstate: { type: String, required: true },
    itempayment: { type: String, required: true },
    itemcount: { type: Number, required: true },
    itemimgpreview: { type: String, required: true }

}, { collection: 'user_itemkeys' })

module.exports = mongoose.model("userItemKeySchema", userItemKeySchema)