const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        data: [],
        tasgel: 0,
        maxRegistrations: null
    }));
}

// Helper function to read database
function readDatabase() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Helper function to write to database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Endpoints

// Get all data
app.get('/api/data', (req, res) => {
    const db = readDatabase();
    res.json(db.data);
});

// Add new registration
app.post('/api/data', (req, res) => {
    const db = readDatabase();
    const newData = req.body;
    
    // Check for duplicates
    const isDuplicate = db.data.some(item => 
        item.useremail === newData.useremail || 
        item.id === newData.id || 
        item.phone === newData.phone
    );
    
    if (isDuplicate) {
        return res.status(400).json({ error: "هذه البيانات بالفعل مسجلة لدينا" });
    }
    
    // Increment tasgel counter
    db.tasgel += 1;
    newData.tasgel = db.tasgel;
    
    // Add to data array
    db.data.push(newData);
    writeDatabase(db);
    
    res.json({ success: true, tasgel: db.tasgel });
});

// Update registration
app.put('/api/data/:tasgel', (req, res) => {
    const db = readDatabase();
    const tasgel = parseInt(req.params.tasgel);
    const updatedData = req.body;
    
    // Check for duplicates excluding current item
    const isDuplicate = db.data.some(item => 
        (item.useremail === updatedData.useremail || 
         item.id === updatedData.id || 
         item.phone === updatedData.phone) && 
        item.tasgel !== tasgel
    );
    
    if (isDuplicate) {
        return res.status(400).json({ error: "هذه البيانات بالفعل مسجلة لدينا" });
    }
    
    // Find and update the item
    const index = db.data.findIndex(item => item.tasgel === tasgel);
    if (index === -1) {
        return res.status(404).json({ error: "التسجيل غير موجود" });
    }
    
    // Reset approval status when data is modified
    updatedData.a = -1;
    db.data[index] = { ...db.data[index], ...updatedData };
    writeDatabase(db);
    
    res.json({ success: true });
});

// Delete registration
app.delete('/api/data/:tasgel', (req, res) => {
    const db = readDatabase();
    const tasgel = parseInt(req.params.tasgel);
    
    const index = db.data.findIndex(item => item.tasgel === tasgel);
    if (index === -1) {
        return res.status(404).json({ error: "التسجيل غير موجود" });
    }
    
    db.data.splice(index, 1);
    writeDatabase(db);
    
    res.json({ success: true });
});

// Get tasgel counter
app.get('/api/tasgel', (req, res) => {
    const db = readDatabase();
    res.json({ tasgel: db.tasgel });
});

// Get max registrations
app.get('/api/max-registrations', (req, res) => {
    const db = readDatabase();
    res.json({ maxRegistrations: db.maxRegistrations });
});

// Set max registrations
app.post('/api/max-registrations', (req, res) => {
    const db = readDatabase();
    db.maxRegistrations = req.body.maxRegistrations;
    writeDatabase(db);
    res.json({ success: true, maxRegistrations: db.maxRegistrations });
});

// Update registration status (approve/reject)
app.post('/api/data/:tasgel/status', (req, res) => {
    const db = readDatabase();
    const tasgel = parseInt(req.params.tasgel);
    const { status } = req.body; // 0 for approved, 1 for rejected
    
    const index = db.data.findIndex(item => item.tasgel === tasgel);
    if (index === -1) {
        return res.status(404).json({ error: "التسجيل غير موجود" });
    }
    
    db.data[index].a = status;
    writeDatabase(db);
    
    res.json({ success: true });
});

// Update attendance status
app.post('/api/data/:tasgel/attendance', (req, res) => {
    const db = readDatabase();
    const tasgel = parseInt(req.params.tasgel);
    const { status } = req.body; // 'دخل القاعة' or 'خرج من القاعة'
    
    const index = db.data.findIndex(item => item.tasgel === tasgel);
    if (index === -1) {
        return res.status(404).json({ error: "التسجيل غير موجود" });
    }
    
    db.data[index].status = status;
    db.data[index].timestamp = new Date().toLocaleString();
    writeDatabase(db);
    
    res.json({ success: true });
});

// Serve HTML files
app.get('/sign-data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-data.html'));
});

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'data.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
