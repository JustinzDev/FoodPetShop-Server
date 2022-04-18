const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    itemname: { type: String, required: true },
    itemdetail: { type: String, required: true },
    itemprice: { type: Number, required: true },
    itemamount: { type: Number, required: true },
    itemselled: { type: Number, required: true },
    itempopular: { type: Number, required: true },
    itemcategory: { type: String, required: true },
    itemimg: { type: String, required: true }
}, { collection: 'items' })

module.exports = mongoose.model("itemSchema", itemSchema)