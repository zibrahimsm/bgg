const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const port = 80;

const adapter = new FileSync('db.json');
const db = low(adapter);

// Varsayılan bir veri tabanı oluştur
db.defaults({ webhooks: [] }).write();

app.listen(port, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});

app.use(bodyParser.json());

app.post('/', (req, res) => {
    const { key } = req.body;

    if (!key) {
        res.status(400).send('Anahtar girilmedi.');
        return;
    }

    const webhook = db.get('webhooks').find({ key }).value();

    if (webhook) {
        res.status(200).send(webhook);
    } else {
        res.status(404).send('Anahtar bulunamadı.');
    }
});

app.post('/createkey', (req, res) => {
    const { key, webhook } = req.body;

    if (!key || !webhook) {
        return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
    }

    db.get('webhooks').push({ key, webhook }).write();

    res.json({ success: true });
});

app.get('/sa', (req, res) => {
    const webhooks = db.get('webhooks').value();
    res.json(webhooks);
});
