const Comment = require('../models/Comment');
const path = require('path');
const fs = require('fs');

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({ order: [['createdAt', 'DESC']] });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

exports.createComment = async (req, res) => {
  const { name, job, text, stars } = req.body;
  const image = req.file ? `uploads/${req.file.filename}` : null;
  try {
    const comment = await Comment.create({ name, job, text, stars, image });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  const { name, job, text, stars } = req.body;
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Review not found' });
    
    let image = comment.image;
    if (req.file) {
      if (image) {
        const oldPath = path.join(__dirname, '..', image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `uploads/${req.file.filename}`;
    }
    
    await comment.update({ name, job, text, stars, image });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Review not found' });
    
    if (comment.image) {
      const oldPath = path.join(__dirname, '..', comment.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    
    await comment.destroy();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
