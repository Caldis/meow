const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Exif = require('exif-js')
const sizeOf = require('image-size')

const imagePaths = fs.readdirSync(__dirname).filter(i => i.toLowerCase().match(/\.jpe?g/)).map(i => path.join(__dirname, i))

// Rename images form exif date
;(async () => {
  for (const i of imagePaths) {
    const data = Exif.readFromBinaryFile(fs.readFileSync(i).buffer)
    const dateMoment = moment(data.DateTimeOriginal, 'YYYY:MM:DD hh:mm:ss')
    const prefix = dateMoment.isValid()
      ? dateMoment.format('YYYY-MM-DD')
      : path.basename(i).replace(/\..+$/, '')
    const dimension = await sizeOf(i)
    const extname = path.extname(i).toLowerCase()
    fs.renameSync(i, path.join(__dirname, `${prefix}.${dimension.width}×${dimension.height}${extname}`))
  }
})()
