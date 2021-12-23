const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Exif = require('exif-js')
const sizeOf = require('image-size')

const imagePaths = fs.readdirSync(__dirname).filter(i => i.toLowerCase().match(/\.jpg/)).map(i => path.join(__dirname, i))

// Rename images form exif date
;(async () => {
  for (const i of imagePaths) {
    const data = Exif.readFromBinaryFile(fs.readFileSync(i).buffer)
    const dateMoment = moment(data.DateTimeOriginal, 'YYYY:MM:DD hh:mm:ss').format('YYYY-MM-DD')
    const dimension = await sizeOf(i)
    const extname = path.extname(i).toLowerCase()
    fs.renameSync(i, path.join(__dirname, `${dateMoment}.${dimension.width}×${dimension.height}${extname}`))
  }
})()
