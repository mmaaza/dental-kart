const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Media = require('../models/media.model');

// Define resize presets
const RESIZE_PRESETS = {
  original: null,
  product: { width: 800, height: 800 },
  thumbnail: { width: 300, height: 300 }
};

// Ensure upload directory exists and has correct permissions
const ensureUploadDirectory = () => {
  // const uploadDir = path.join(process.cwd(), '../public/uploads');
  const uploadDir = path.join('/var/www/medical-bazzar/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  } else {
    // Ensure correct permissions on existing directory
    fs.chmodSync(uploadDir, 0o755);
  }
  return uploadDir;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = ensureUploadDirectory();
      console.log('Upload directory:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error ensuring upload directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${sanitizedFilename}`;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, videos, and documents
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const processImage = async (file, size) => {
  if (!size) return file.path; // Return original path if no resize needed
  
  const ext = path.extname(file.path);
  const resizedPath = file.path.replace(ext, `_${size.width}x${size.height}${ext}`);
  
  await sharp(file.path)
    .resize(size.width, size.height, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFile(resizedPath);
    
  return resizedPath;
};

// @desc    Upload media files
// @route   POST /api/media/upload
// @access  Private
const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const resizeOption = req.body.resize || 'original';
    if (!RESIZE_PRESETS.hasOwnProperty(resizeOption)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resize option'
      });
    }

    const mediaItems = await Promise.all(
      req.files.map(async (file) => {
        let processedPath = file.path;
        
        // Only process images
        if (file.mimetype.startsWith('image/')) {
          processedPath = await processImage(file, RESIZE_PRESETS[resizeOption]);
        }
        
        // Store URL path relative to the frontend public directory
        const url = `/uploads/${path.basename(processedPath)}`;
        
        const media = await Media.create({
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: url,
          createdBy: req.user.id,
          resizeOption: resizeOption
        });
        
        // Delete original file if it was resized
        if (processedPath !== file.path) {
          fs.unlinkSync(file.path);
        }
        
        return media;
      })
    );

    res.status(201).json({
      success: true,
      data: mediaItems
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all media items
// @route   GET /api/media
// @access  Private
const getMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete media item
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    // Check if user is authorized to delete
    if (media.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this media'
      });
    }

    // Delete file from storage using absolute path
    const filePath = path.join(process.cwd(), '../public', media.url);
    console.log('Deleting file:', filePath); // Debug log
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  upload,
  uploadMedia,
  getMedia,
  deleteMedia
};