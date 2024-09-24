const express = require('express');
const app = express();
//const AWS = require('aws-sdk');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { Upload } = require('@aws-sdk/lib-storage'); // For multipart file uploads


const PORT = process.env.PORT || 3000;



// AWS S3 Client Configuration (using AWS SDK v3)
const s3 = new S3Client({
    region: 'ap-south-1', // Replace with your region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Set in your environment variables
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


// Multer setup for file uploads (without multer-s3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory



// MySQL connection
const db = mysql.createConnection({
    host: 'healthy-db.cfdovopsmgxy.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'edcrfvtgb123',
    database: 'doctor_appointment',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});


// Function to upload file to S3
const uploadFileToS3 = async (file) => {
    const uploadParams = {
        Bucket: 'patient-records-healthy',
        Key: Date.now().toString() + '-' + file.originalname, // Unique file name
        Body: file.buffer, // File is in memory, handled by multer
        ContentType: file.mimetype, // Set the content type (e.g., image/jpeg, application/pdf)
    };

    try {
        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${uploadParams.Bucket}.s3.${s3.config.region}.amazonaws.com/${uploadParams.Key}`;
        return fileUrl;
    } catch (err) {
        console.error('Error uploading file:', err);
        throw new Error('Failed to upload file to S3');
    }
};



// Route to add client
app.post('/add-client', upload.single('file'), (req, res) => {
    const { first_name, last_name, contact_number, email, age } = req.body;
	const file = req.file;
	
    const sql = 'INSERT INTO clients (first_name, last_name, contact_number, email, age) VALUES (?, ?, ?, ?, ?)';
    const values = [first_name, last_name, contact_number, email, age];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting client:', error);
            return res.status(500).send('Error adding client');
        }

        try {
            // Upload the file to S3
            const fileUrl = await uploadFileToS3(file);

            res.send(`
                <p>Patient record added successfully!</p>
                <p>File uploaded to S3: <a href="${fileUrl}" target="_blank">View File</a></p>
                <img src="${fileUrl}" style="max-width: 100%; height: auto;" />
                <a href="/index.html">Go back to form</a>
            `);
        } catch (err) {
            res.status(500).send('Error uploading file to S3');
        }       
    });
	
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});


app.use(express.static('public')); // Serve static files from the 'public' directory
