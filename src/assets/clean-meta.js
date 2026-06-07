const fs = require('fs')
const path = require('path')
const piexif = require('piexif')

// 抹掉照片里的敏感信息,再公开发布:
//   - GPS 定位(整段)
//   - 设备/拍摄者标识:机身&镜头序列号、相机所有者、作者署名、图像唯一 ID、主机名
// 保留拍摄日期 / 朝向 / 相机型号等非敏感字段——画廊靠文件名里的日期排序与展示,
// 不依赖运行时 EXIF。建议在 build:photo-rename 之后运行(rename 需要读 EXIF 日期)。
//
// 注:tiff/jpeg 用 piexif 原地剔除;若随后跑 build:photo-optimize 转 webp,sharp 默认
// 不保留任何 EXIF,等于再兜底清一次。

// 需抹掉的字段(原始 EXIF tag 号,避免依赖 piexif 常量名是否暴露)
const SENSITIVE = {
  '0th': [315 /* Artist */, 316 /* HostComputer */],
  Exif: [
    42016 /* ImageUniqueID */,
    42032 /* CameraOwnerName */,
    42033 /* BodySerialNumber */,
    42035 /* LensSerialNumber */,
  ],
}

const imageFiles = fs.readdirSync(__dirname)
  .filter((file) => /\.(jpg|jpeg|tiff|heic)$/i.test(file))
  .map((file) => path.join(__dirname, file))

;(async () => {
  for (const file of imageFiles) {
    try {
      const buffer = fs.readFileSync(file)
      const binary = buffer.toString('binary')
      const exifObj = piexif.load(binary)
      const removed = []

      // GPS 定位:整段抹掉
      if (exifObj.GPS && Object.keys(exifObj.GPS).length) {
        delete exifObj.GPS
        removed.push('GPS')
      }
      // 设备/拍摄者标识:逐项抹掉
      for (const [ifd, tags] of Object.entries(SENSITIVE)) {
        if (!exifObj[ifd]) continue
        for (const tag of tags) {
          if (exifObj[ifd][tag] !== undefined) {
            delete exifObj[ifd][tag]
            removed.push(`${ifd}:${tag}`)
          }
        }
      }

      if (removed.length) {
        const exifBytes = piexif.dump(exifObj)
        const newBinary = piexif.insert(exifBytes, binary)
        fs.writeFileSync(file, Buffer.from(newBinary, 'binary'))
        console.log(`已抹掉敏感信息(${removed.length} 项): ${path.basename(file)}`)
      } else {
        console.log(`无敏感信息: ${path.basename(file)}`)
      }
    } catch (err) {
      console.error(`处理失败 ${path.basename(file)}: ${err.message}`)
    }
  }
})()
