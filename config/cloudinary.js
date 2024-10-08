const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = (filePath, folder) => {
  
    return new Promise((resolve, reject) => {
      
      cloudinary.uploader.upload(filePath.tempFilePath, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            id: result.public_id
          });
        }
      });
    });
  };

  module.exports = {
    uploadToCloudinary
  }
  