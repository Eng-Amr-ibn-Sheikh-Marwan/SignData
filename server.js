const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware لتحليل JSON ودعم CORS
app.use(express.json());
app.use(cors());

// تخزين البيانات
let sharedData = null;

// route لاستقبال البيانات من الموقع الأول
app.post('/save-data', (req, res) => {
    sharedData = req.body; // حفظ البيانات المرسلة
    res.send('تم حفظ البيانات بنجاح!');
});

// route لجلب البيانات من الموقع الثاني
app.get('/get-data', (req, res) => {
    res.json(sharedData); // إرسال البيانات المحفوظة
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`الخادم يعمل على المنفذ ${port}`);
});
