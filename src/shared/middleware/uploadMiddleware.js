import multer from "multer"

// memoryStorage
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedList = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (allowedList.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Unsupported mime type"))
        }
    }
})

export const uploadFlie = upload.single('image')

