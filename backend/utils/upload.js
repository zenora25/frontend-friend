import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadLogbookDir = path.join(__dirname, '../uploads/logbooks');
const uploadLetterDir = path.join(__dirname, '../uploads/letters');
const uploadProfileDir = path.join(__dirname, '../uploads/profiles');

[uploadLogbookDir, uploadLetterDir, uploadProfileDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = uploadLogbookDir;
        if (file.fieldname === 'letter') dir = uploadLetterDir;
        if (file.fieldname === 'profileImage') dir = uploadProfileDir;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        let prefix = 'logbook';
        if (file.fieldname === 'letter') prefix = 'letter';
        if (file.fieldname === 'profileImage') prefix = 'profile';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image, PDF, and document files are allowed'));
    }
};

// Create upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Multiple file upload middleware
const uploadMultiple = upload.array('images', 10); // Max 10 files

// Single file upload middleware
const uploadSingle = upload.single('image');
const uploadLetter = upload.single('letter');
const uploadProfile = upload.single('profileImage');

export { upload, uploadMultiple, uploadSingle, uploadLetter, uploadProfile };