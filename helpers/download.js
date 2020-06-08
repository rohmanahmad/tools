'use strict'

const request = require('request-promise')
const fs = require('fs')
const path = require('path')

// another helpers
const mkdir = require('./mkdir')

class Download {
    constructor (options = {}) {
        this.options = options
    }

    async fromUrl ({method, url, pathDestination, filename}) {
        if (!method || (method && method.length === 0)) method = 'get'
        await mkdir(pathDestination)
        switch (method) {
            case 'get':
                const downloadFile = path.join(pathDestination, filename)
                try {
                    const file = fs.statSync(downloadFile)
                    if (!file || (file && file['size'] > 0)) {
                        console.log(`[Download]`, downloadFile, '(skipped)')
                        return true
                    } 
                    throw new Error('')
                } catch (err) {
                    console.log('File is not exists (downloading)')
                    await request(url).pipe(fs.createWriteStream(downloadFile))
                    console.log(`[Download]`, downloadFile, '(downloaded)')
                }
                break;
            default:
                throw new Error('Unsupported Method')
        }
        return true
    }
}

module.exports = function (options) {
    const req = new Download(options)
    return req
}