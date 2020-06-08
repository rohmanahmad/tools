'use strict'

require('./providers/mongodb')({
    uri: 'mongodb://127.0.0.1:27017/quran',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
})
const path = require('path')
const url = require('url')
const request = require('request-promise')
const QuranDataModel = require('./models/Quran/QuranData')

// helpers
const download = require('./helpers/download')
const { sleep } = require('./helpers/timer')

class QuranCrawler {
    async start ({ startSurah, totalSurah }) {
        const endpointPattern = 'https://api.quran.sutanlab.id/surah/{:surah}'
        for (let numberSurah = startSurah; numberSurah <= totalSurah; numberSurah++) {
            try {
                const url = endpointPattern.replace('{:surah}', numberSurah)
                console.log(`accessing ${url}`)
                const { data } = (await request.get(url, {json: true})) || {}
                if (data) {
                    await this.saveToCollection({ data })
                }
                await sleep(10)
            } catch (err) {
                console.error(err)
            }
        }
        return this
    }

    async saveToCollection ({ data }) {
        let numberOfAyah = 1
        for (const ayah of data.ayahs) {
            try {
                console.log(`...trying updating data surah[${data.englishName}] ayah[${numberOfAyah}]`)
                await QuranDataModel.updateOne({
                    number: data.number,
                    'ayah.numberInSurah': numberOfAyah
                }, {
                    $setOnInsert: {...data, ayah},
                    $set: {last_update: new Date()}
                }, { upsert: true })
                numberOfAyah += 1
            } catch (err) {
                console.error(err)
            }
        }
    }

    async downloadAssets ({ limit }) {
        let isNext = true
        while (isNext) {
            isNext = await this.downloadingAudios({ limit })
            await sleep(10)
        }
    }

    async downloadingAudios ({ limit }) {
        try {
            const data = await QuranDataModel.find({
                'audios.localFiles': {
                    $exists: false
                }
            })
                .limit(limit)
            for (const d of data) {
                try {
                    const id = d._id
                    const files = [...d.ayah.audioSecondary, d.ayah.audio]
                    let localFiles = []
                    for (const file of files) {
                        const { pathname } = url.parse(file)
                        const filename = pathname.split('/').pop()
                        const folderPath = pathname.replace(`/${filename}`, '')
                        const destinationFolder = path.join(__dirname, 'assets', folderPath)
                        const newFilename = filename.replace('.mp3', '') + '.mp3'
                        await download()
                            .fromUrl({
                                method: 'get',
                                url: file,
                                pathDestination: destinationFolder,
                                filename: newFilename
                            })
                        localFiles.push(path.join('assets', folderPath, newFilename))
                    }
                    await this.updateLocalFile(id, localFiles)
                } catch (err) {
                    console.error(err)
                }
            }
            return (data.length === limit)
        } catch (err) {
            console.error(err)
        }
    }

    async updateLocalFile(id, localFiles) {
        await QuranDataModel.updateOne({ _id: id }, { $set: { 'audios.localFiles': localFiles } })
    }
}
    
new QuranCrawler()
    .start({ startSurah: 114, totalSurah: 114 })
    .then(function (instance) {
        console.log('-- start downloading medias...')
        instance
            .downloadAssets({ limit: 10 })
                .then(console.log)
    })