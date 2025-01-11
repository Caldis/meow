const fs = require('fs')
const path = require('path')
const piexif = require('piexif')

// 获取当前目录下所有图片文件
const imageFiles = fs.readdirSync(__dirname)
    .filter(file => /\.(jpg|jpeg|tiff|heic)$/i.test(file))
    .map(file => path.join(__dirname, file))

;(async () => {
    for (const file of imageFiles) {
        try {
            // 读取图片
            const buffer = fs.readFileSync(file)
            const binary = buffer.toString('binary')

            // 处理EXIF数据
            const exifObj = piexif.load(binary)

            // 删除GPS信息
            if (exifObj['GPS']) {
                delete exifObj['GPS']
                // 写回文件
                const exifBytes = piexif.dump(exifObj)
                const newBinary = piexif.insert(exifBytes, binary)
                fs.writeFileSync(file, Buffer.from(newBinary, 'binary'))
                console.log(`已清除GPS信息: ${path.basename(file)}`)
            } else {
                console.log(`无GPS信息: ${path.basename(file)}`)
            }
        } catch (err) {
            console.error(`处理失败 ${path.basename(file)}: ${err.message}`)
        }
    }
})()