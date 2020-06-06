'use strict'

const request = require('request-promise')
const mongoose = require('./providers/mongodb')({
    uri: 'mongodb://127.0.0.1:27017/quran',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
})
const QuranDataModel = require('./models/Quran/QuranData')

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
            } catch (err) {
                console.error(err)
            }
        }
    }

    async saveToCollection ({ data }) {
        let numberOfAyah = 1
        for (const ayah of data.ayahs) {
            try {
                console.log(`...trying updating data surah[${data.englishName}] ayah[${numberOfAyah}]`)
                await QuranDataModel.updateOne({
                    number: data.number,
                    'ayah.number': numberOfAyah
                }, { ...data, ayah }, { upsert: true })
                numberOfAyah += 1
            } catch (err) {
                console.error(err)
            }
        }
    }
}
    
new QuranCrawler().start({ startSurah: 1, totalSurah: 114 }).catch(console.error).then(console.log)