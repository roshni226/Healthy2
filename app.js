const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// MySQL connection
const db = mysql.createConnection({
    host: 'healthy-db.cfdovopsmgxy.ap-south-1.rds.amazonaws.com',
    user: '<your-username>',
    password: '<your-password>',
    database: 'patient_records',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Route to add client
app.post('/add-client', (req, res) => {
    const { first_name, last_name, contact_number, email, age } = req.body;

    const sql = 'INSERT INTO clients (first_name, last_name, contact_number, email, age) VALUES (?, ?, ?, ?, ?)';
    const values = [first_name, last_name, contact_number, email, age];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting client:', error);
            return res.status(500).send('Error adding client');
        }
        res.status(200).send('Client added successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.use(express.static('public')); // Serve static files from the 'public' directory
