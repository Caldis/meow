const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Exif = require('exif-js')
const sizeOf = require('image-size')

// 获取当前目录下所有jpg/jpeg图片的完整路径
const imagePaths = fs.readdirSync(__dirname)
    .filter(i => i.toLowerCase().match(/\.jpe?g/))
    .map(i => path.join(__dirname, i))

console.log(`找到 ${imagePaths.length} 个图片文件`)

// 遍历处理每个图片文件
;(async () => {
  for (const i of imagePaths) {
    try {
      // 读取图片EXIF信息
      const data = Exif.readFromBinaryFile(fs.readFileSync(i).buffer)

      // 从EXIF中获取拍摄日期,格式化为YYYY-MM-DD
      const dateMoment = moment(data.DateTimeOriginal, 'YYYY:MM:DD hh:mm:ss')
      const prefix = dateMoment.isValid()
          ? dateMoment.format('YYYY-MM-DD')
          : path.basename(i).replace(/\..+$/, '') // 如果无日期则使用原文件名

      // 获取图片尺寸信息
      const dimension = await sizeOf(i)
      const extname = path.extname(i).toLowerCase()

      // 组装新文件名并重命名
      const newPath = path.join(__dirname, `${prefix}.${dimension.width}×${dimension.height}${extname}`)
      fs.renameSync(i, newPath)

      console.log(`处理成功: ${path.basename(i)} -> ${path.basename(newPath)}`)
    } catch (err) {
      console.error(`处理失败 ${path.basename(i)}: ${err.message}`)
    }
  }

  console.log('\n处理完成!')
})()