const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const uploadDirs = ['uploads/', 'private_uploads/videos/'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If it's a video, put it in private_uploads
    if (file.mimetype.startsWith('video/')) {
      cb(null, 'private_uploads/videos/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    // Xavfsiz fayl nomi — faqat raqam va extension
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Max 500MB (videolar uchun)
    files: 5, // Bir vaqtda max 5 fayl (sozlamalar uchun)
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|webp|gif|svg/;
    const allowedVideoTypes = /mp4|webm|ogg|mkv|avi|mov/;
    
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (file.mimetype.startsWith('image/')) {
      if (allowedImageTypes.test(ext)) {
        return cb(null, true);
      }
      return cb(new Error('Faqat rasm formatlari ruxsat etiladi: jpg, png, webp, gif'));
    }
    
    if (file.mimetype.startsWith('video/')) {
      if (allowedVideoTypes.test(ext)) {
        return cb(null, true);
      }
      return cb(new Error('Faqat video formatlari ruxsat etiladi: mp4, webm, ogg, mkv'));
    }
    
    cb(new Error('Faqat rasm yoki video fayllar ruxsat etiladi!'));
  },
});

module.exports = upload;
