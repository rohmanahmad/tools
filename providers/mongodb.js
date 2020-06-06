'use strict'

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

module.exports = function ({ uri, options }) {
    if (!mongoose.connection.readyState) {
        mongoose.connect(uri, options)
    }
    return mongoose
}
