'use strict'

const path = require('path')
const { mkdirSync, lstatSync } = require('fs')

module.exports = function (destination) {
    return new Promise((resolve, reject) => {
        let parentDir = '/'
        const elements = destination.split('/').filter(x => x.length > 0)
        for (const element of elements) {
            parentDir += element + '/'
            try {
                const isDir = lstatSync(parentDir).isDirectory()
                if (!isDir) throw new Error('Directory is not exists.')
            } catch (err) {
                console.log('Creating folder: ', parentDir)
                mkdirSync(parentDir)
            }
        }
        return resolve()
    })
}
