const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 80;

// SQLite veritabanı oluştur ve tabloyu oluştur
const db = new sqlite3.Database('database.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS webhooks (webhook TEXT)");
    // Örnek veri eklemek için bu satırı kullanabilirsiniz
    // db.run("INSERT INTO webhooks (webhook) VALUES ('sakl')");
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

    db.get("SELECT webhook FROM webhooks", [], (err, row) => {
        if (err) {
            console.error('Anahtar bulma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        if (row) {
            res.status(200).send(row.webhook);
        } else {
            res.status(404).send('Anahtar bulunamadı.');
        }
    });
});

app.post('/createkey', (req, res) => {
    const { webhook } = req.body;

    if (!webhook) {
        return res.status(400).json({ error: 'Webhook gereklidir.' });
    }

    db.run("DELETE FROM webhooks", [], (err) => {
        if (err) {
            console.error('Anahtar oluşturma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        db.run("INSERT INTO webhooks (webhook) VALUES (?)", [webhook], (err) => {
            if (err) {
                console.error('Anahtar oluşturma hatası:', err);
                res.status(500).send('Sunucu hatası');
                return;
            }

            res.json({ success: true });
        });
    });
});

app.get('/sa', (req, res) => {
    db.all("SELECT webhook FROM webhooks", (err, rows) => {
        if (err) {
            console.error('Veri alma hatası:', err);
            res.status(500).send('Sunucu hatası');
            return;
        }

        res.json(rows.map(row => row.webhook));
    });
});
