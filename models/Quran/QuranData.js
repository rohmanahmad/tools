'use strict'

const mongoose = require('mongoose')

const schema = mongoose.Schema({
    "createdAt": Date,
    "updatedAt": Date,
    "idRevelationType": String,
    "idNameTranslation": String,
    "number": Number,
    "name": String, // in arabic
    "englishName": String,
    "englishNameTranslation": String,
    "revelationType": String,
    "numberOfAyahs": Number,
    "audios": {},
    "ayah": {}
})

schema.index({number: 1})
schema.index({englishName: 1})
schema.index({number: 1, "ayah.numberInSurah": 1}, {unique: true})

module.exports = mongoose.model('quran_data', schema, 'quran_data')
