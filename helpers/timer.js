'use strict'

module.exports = {
    sleep: function ( seconds ) {
        return new Promise((resolve) => {
            console.log('awaiting...')
            setTimeout(function () {
                return resolve()
            }, seconds * 1000)
        })
    }
}