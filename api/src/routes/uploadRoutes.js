const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadToSupabase = require('../services/uploadToSupabase');

// Configure multer to store file in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const imageUrl = await uploadToSupabase(req.file);

        res.json({
            success: true,
            imageUrl
        });
    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload image'
        });
    }
});

module.exports = router;
