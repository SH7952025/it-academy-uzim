const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const compressImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  const originalPath = req.file.path;
  const ext = path.extname(originalPath).toLowerCase();
  
  // Skip SVG or GIF animations to keep them correct
  if (ext === '.gif' || ext === '.svg') {
    return next();
  }

  // Create a WebP filename
  const baseName = path.basename(originalPath, ext);
  const compressedFilename = 'compressed_' + baseName + '.webp';
  const compressedPath = path.join(path.dirname(originalPath), compressedFilename);

  try {
    // Resize to max 1200px width/height and compress to 80% WebP
    await sharp(originalPath)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(compressedPath);

    // Delete the original raw/gigantic file
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }

    // Replace the request file properties so controllers save the optimized file
    req.file.path = compressedPath.replace(/\\/g, '/');
    req.file.filename = compressedFilename;
    req.file.mimetype = 'image/webp';
    
    const stat = fs.statSync(compressedPath);
    req.file.size = stat.size;

    console.log(`[Compression Success] Compressed image from ${originalPath} to ${compressedPath}. New size: ${Math.round(req.file.size / 1024)} KB`);
    next();
  } catch (error) {
    console.error('[Compression Failed] Falling back to original image:', error);
    next();
  }
};

module.exports = compressImage;
