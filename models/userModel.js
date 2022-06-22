const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    address: { type: String, required: true } ,
    admin: { type: String, required: true }

}, { collection: 'users' })

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, username: this.username, email: this.email, phone: this.telephone, firstname: this.firstname, lastname: this.lastname, admin: this.admin }, process.env.JWTPRIVATEKEY, { expiresIn: '24h' })
    return token
}

module.exports = mongoose.model("userSchema", userSchema)