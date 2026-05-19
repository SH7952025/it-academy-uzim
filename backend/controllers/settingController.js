const Setting = require('../models/Setting');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        updates[file.fieldname] = `/uploads/${file.filename}`;
      });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (key && value !== undefined) {
        await Setting.upsert({ 
          key: String(key), 
          value: value === null ? null : String(value) 
        });
      }
    }
    
    res.json({ 
      success: true,
      message: 'Settings updated successfully', 
      ...updates 
    });
  } catch (error) {
    console.error('CRITICAL: Setting Update Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Serverda xatolik yuz berdi', 
      error: error.message 
    });
  }
};
