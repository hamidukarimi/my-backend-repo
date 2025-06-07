// Install form-data if you haven't:
// npm install form-data

// utils/uploadToImgBB.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const uploadToImgBB = async (filePath, fileName) => {
  try {
    // Read image as base64 string
    const imageData = fs.readFileSync(filePath, { encoding: 'base64' });

    // Create FormData and append fields
    const form = new FormData();
    form.append('image', imageData);
    form.append('name', fileName);

    // Send POST as multipart/form-data
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    return response.data.data.url; // Hosted image URL
  } catch (err) {
    console.error('ImgBB Upload Failed:', err.message);
    return null;
  }
};

module.exports = uploadToImgBB;