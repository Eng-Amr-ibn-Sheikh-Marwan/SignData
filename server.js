const express = require('express');
const app = express();
const port = 3000;

// Middleware لتحليل JSON
app.use(express.json());

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
    console.log(`الخادم يعمل على https://eng-amr-ibn-sheikh-marwan.github.io/SignData/`);
});
