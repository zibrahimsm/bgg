const express = require('express');
const bodyParser = require('body-parser');
const db = require('quick.db');

const app = express();
const port = 80;

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

    try {
        const webhook = db.get(key);

        if (webhook) {
            res.status(200).send(webhook);
        } else {
            res.status(404).send('Anahtar bulunamadı.');
        }
    } catch (error) {
        console.error('Anahtar bulma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.post('/createkey', (req, res) => {
    const { key, webhook } = req.body;

    if (!key || !webhook) {
        return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
    }

    try {
        db.set(key, webhook);
        res.json({ success: true });
    } catch (error) {
        console.error('Anahtar oluşturma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.get('/sa', (req, res) => {
    try {
        const data = db.all();
        res.json(data);
    } catch (error) {
        console.error('Veri alma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});
