// server/middlewares/upload.js
 
const multer = require('multer');
const { nanoid } = require('nanoid');
// Note: The newer version 4 or 5 only supports ES6 syntax “import”,
// not ES5 syntax “require”.
// We need to use version 3 for ES5.

const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, nanoid(10) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 }
}).single('file'); // file input name

module.exports = { upload };