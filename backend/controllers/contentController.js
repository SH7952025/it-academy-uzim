const { Gallery, News } = require('../models/Content');
const path = require('path');
const fs = require('fs');

// --- NEWS ---
exports.getNews = async (req, res) => {
  try {
    const news = await News.findAll({ order: [['date', 'DESC']] });
    res.json(news);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null;
    const news = await News.create({ title, content, image });
    res.status(201).json(news);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ message: 'Topilmadi' });
    if (news.image) {
      const filePath = path.join(__dirname, '..', news.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await news.destroy();
    res.json({ message: 'O\'chirildi' });
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

// --- GALLERY ---
exports.getGallery = async (req, res) => {
  try {
    const images = await Gallery.findAll({ order: [['id', 'DESC']] });
    res.json(images);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Rasm tanlanmagan' });
    const image = await Gallery.create({ 
      image: `uploads/${req.file.filename}`,
      caption: req.body.caption || ''
    });
    res.status(201).json(image);
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};

exports.deleteGallery = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) return res.status(404).json({ message: 'Topilmadi' });
    const filePath = path.join(__dirname, '..', image.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await image.destroy();
    res.json({ message: 'O\'chirildi' });
  } catch (error) { res.status(500).json({ message: 'Xatolik' }); }
};
