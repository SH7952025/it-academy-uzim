const Contact = require('../models/Contact');

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

exports.createContact = async (req, res) => {
  const { name, phone, message } = req.body;
  try {
    const contact = await Contact.create({ name, phone, message });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Not found' });
    await contact.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting', error: error.message });
  }
};
