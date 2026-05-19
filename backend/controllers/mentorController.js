const Mentor = require('../models/Mentor');
const fs = require('fs');

exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.findAll();
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Error fetching mentors', error: error.message });
  }
};

exports.createMentor = async (req, res) => {
  const { name, speciality, telegram, instagram, facebook, linkedin, github } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    const freshMentor = await Mentor.create({ 
      name, speciality, image, 
      telegram, instagram, facebook, linkedin, github 
    });
    res.status(201).json(freshMentor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating mentor', error: error.message });
  }
};

exports.updateMentor = async (req, res) => {
  const { name, speciality, telegram, instagram, facebook, linkedin, github } = req.body;
  const image = req.file ? req.file.path : undefined;
  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Not found' });
    
    // Delete old image if updating
    if (image && mentor.image) {
      if (fs.existsSync(mentor.image)) fs.unlinkSync(mentor.image);
    }

    await mentor.update({ 
      name: name || mentor.name, 
      speciality: speciality || mentor.speciality, 
      image: image !== undefined ? image : mentor.image,
      telegram: telegram !== undefined ? telegram : mentor.telegram,
      instagram: instagram !== undefined ? instagram : mentor.instagram,
      facebook: facebook !== undefined ? facebook : mentor.facebook,
      linkedin: linkedin !== undefined ? linkedin : mentor.linkedin,
      github: github !== undefined ? github : mentor.github
    });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating mentor', error: error.message });
  }
};

exports.deleteMentor = async (req, res) => {
  console.log('DELETE request received for mentor ID:', req.params.id);
  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Not found' });
    if (mentor.image && fs.existsSync(mentor.image)) fs.unlinkSync(mentor.image);
    await mentor.destroy();
    res.json({ message: 'Mentor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mentor', error: error.message });
  }
};
