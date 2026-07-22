import Form from '../models/formmodel.js';

export const submitForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body; // Debugging log

    const savedForm = await Form.create({
      name,
      email,
      phone,
      message,
    });
    

    res.json({ 
      message: 'Form submitted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
};