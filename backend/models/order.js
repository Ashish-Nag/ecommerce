const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    name: String,

})

module.exports = mongoose.model('Order', OrderSchema)