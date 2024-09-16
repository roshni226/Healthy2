// app.js
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // The folder where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Append timestamp to file name to make it unique
    }
});

// Initialize multer for file uploads
const upload = multer({ storage: storage });

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission, including file upload
app.post('/submit', upload.single('recordFile'), (req, res) => {
    const { firstName, lastName, email, age } = req.body;
    const file = req.file;

    // Format data as CSV
    const data = `${firstName},${lastName},${email},${age},${file.path}\n`;

    // Save data to a CSV file
    fs.appendFile('data.csv', data, (err) => {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Server error. Unable to save data.');
        } else {
            res.send('Data and file saved successfully!');
        }
    });
});

// Create the 'uploads' directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
