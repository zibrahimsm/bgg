const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 80;

// SQLite veritabanı oluştur
const db = new sqlite3.Database('database.db');

// Tabloyu oluştur
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS webhooks (key TEXT PRIMARY KEY, webhook TEXT)");
});

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

    db.get("SELECT * FROM webhooks WHERE key = ?", [key], (err, row) => {
        if (err) {
            console.error('Anahtar bulma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        if (row) {
            res.status(200).send(row);
        } else {
            res.status(404).send('Anahtar bulunamadı.');
        }
    });
});

app.post('/createkey', (req, res) => {
    const { key, webhook } = req.body;

    if (!key || !webhook) {
        return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
    }

    db.run("INSERT INTO webhooks (key, webhook) VALUES (?, ?)", [key, webhook], (err) => {
        if (err) {
            console.error('Anahtar oluşturma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        res.json({ success: true });
    });
});

app.get('/sa', (req, res) => {
    db.all("SELECT * FROM webhooks", (err, rows) => {
        if (err) {
            console.error('Veri alma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        res.json(rows);
    });
});
