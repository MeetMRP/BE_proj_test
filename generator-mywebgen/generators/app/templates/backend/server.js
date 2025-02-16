const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Read data from JSON file
const readData = () => {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data);
};

// Write data to JSON file
const writeData = (data) => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

// API Endpoint to get stored contact messages
app.get('/api/messages', (req, res) => {
    res.json(readData());
});

// API Endpoint to submit contact form
app.post('/api/contact', (req, res) => {
    const data = readData();
    data.messages.push(req.body);
    writeData(data);
    res.status(201).json({ message: 'Message received!' });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
