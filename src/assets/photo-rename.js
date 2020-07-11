const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ExifReader = require('exifreader')

const imagePaths = fs.readdirSync(__dirname).filter(i => i.match(/\.JPG|\.jpg/)).map(i => path.join(__dirname, i))

// Rename images form exif date
imagePaths.forEach(i => {
  const tags = ExifReader.load(fs.readFileSync(i), { expanded: false })
  const dateValue = (tags.DateCreated || tags['Date Created']).description
  const dateMoment = moment(dateValue).format('YYYY-MM-DD')
  const extname = path.extname(i)
  fs.renameSync(i, `${dateMoment}${extname}`)
})
