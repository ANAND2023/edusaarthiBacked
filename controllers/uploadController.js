const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Upload and compress file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');
    const type = req.params.type || 'documents';

    let finalPath = file.path;
    let finalFilename = file.filename;

    // Compress images using sharp
    if (isImage) {
      const ext = path.extname(file.filename);
      const nameWithoutExt = path.basename(file.filename, ext);
      const compressedFilename = `${nameWithoutExt}.webp`;
      const compressedPath = path.join(path.dirname(file.path), compressedFilename);

      await sharp(file.path)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(compressedPath);

      // Remove original uncompressed file
      fs.unlinkSync(file.path);

      finalPath = compressedPath;
      finalFilename = compressedFilename;
    }

    // Return the relative path that can be used to access the file
    const baseUrl = process.env.BASE_URL || "https://api.digitalvidyasaarthi.com";
    const relativePath = `${baseUrl}/uploads/${type}/${finalFilename}`;

    res.json({
      message: 'File uploaded successfully',
      path: relativePath,
      originalName: file.originalname,
      size: fs.statSync(finalPath).size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading file' });
  }
};

// Upload multiple files
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const type = req.params.type || 'documents';
    const results = [];

    for (const file of req.files) {
      const isImage = file.mimetype.startsWith('image/');
      let finalPath = file.path;
      let finalFilename = file.filename;

      if (isImage) {
        const ext = path.extname(file.filename);
        const nameWithoutExt = path.basename(file.filename, ext);
        const compressedFilename = `${nameWithoutExt}.webp`;
        const compressedPath = path.join(path.dirname(file.path), compressedFilename);

        await sharp(file.path)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(compressedPath);

        fs.unlinkSync(file.path);
        finalPath = compressedPath;
        finalFilename = compressedFilename;
      }

      results.push({
        path: `/uploads/${type}/${finalFilename}`,
        originalName: file.originalname,
        size: fs.statSync(finalPath).size,
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: results,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
};

// Delete uploaded file
exports.deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    // Ensure the path is within uploads directory (security check)
    const fullPath = path.join(__dirname, '..', filePath);
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: 'Invalid file path' });
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};
