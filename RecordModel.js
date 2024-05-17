const mongoose = require('mongoose')

const RecordSchema = mongoose.Schema({
    name: String,
    description: String

}, {
    timestamps: true
})
module.exports = mongoose.model('Record', RecordSchema)