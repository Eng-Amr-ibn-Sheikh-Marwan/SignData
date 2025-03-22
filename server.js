// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware لتحليل JSON
app.use(bodyParser.json());

// ملف لتخزين البيانات (بدلاً من قاعدة بيانات)
const DATA_FILE = 'data.json';

// تهيئة الملف إذا لم يكن موجودًا
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// حفظ البيانات
app.post('/save', (req, res) => {
    const newData = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.push(newData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    res.send('تم حفظ البيانات بنجاح!');
});

// جلب البيانات
app.get('/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});