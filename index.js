const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 80;

// MongoDB bağlantı adresi
const mongoURI = 'mongodb+srv://ardamaaiky:12121768806@api.tnbd8a2.mongodb.net/';

// MongoDB'ye bağlanma işlemi
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// MongoDB'de anahtar-webhook çiftlerini tutacak olan model
const WebhookModel = mongoose.model('Webhook', {
  key: String,
  webhook: String
});

app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});

app.use(bodyParser.json());

// Anahtarın karşılık geldiği webhook'u döndüren endpoint
app.post('/', async (req, res) => {
  const { key } = req.body;

  if (!key) {
    res.status(400).send('Anahtar girilmedi.');
    return;
  }

  try {
    const webhookData = await WebhookModel.findOne({ key });
    if (webhookData) {
      res.status(200).send(webhookData.webhook);
    } else {
      res.status(404).send('Anahtar bulunamadı.');
    }
  } catch (error) {
    console.error('Anahtar bulma hatası:', error);
    res.status(500).send('Sunucu hatası');
  }
});

// Yeni bir anahtar-webhook çifti oluşturan endpoint
app.post('/createkey', async (req, res) => {
  const { key, webhook } = req.body;

  if (!key || !webhook) {
    return res.status(400).json({ error: 'Anahtar ve Webhook gereklidir.' });
  }

  try {
    await WebhookModel.create({ key, webhook });
    res.json({ success: true });
  } catch (error) {
    console.error('Anahtar oluşturma hatası:', error);
    res.status(500).send('Sunucu hatası');
  }
});

// Tüm anahtar-webhook çiftlerini döndüren endpoint
app.get('/sa', async (req, res) => {
  try {
    const webhookData = await WebhookModel.find();
    const jsonData = webhookData.reduce((acc, curr) => {
      acc[curr.key] = curr.webhook;
      return acc;
    }, {});
    const plainText = Object.values(jsonData).join('\n');
    res.type('text/plain').send(plainText);
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    res.status(500).send('Sunucu hatası');
  }
});


app.get('/keysorgu', async (req, res) => {
  const { key } = req.query;

  if (!key) {
    res.status(400).send('Anahtar belirtilmedi.');
    return;
  }

  try {
    const webhookData = await WebhookModel.findOne({ key });
    if (webhookData) {
      res.status(200).send(webhookData.webhook);
    } else {
      res.status(404).send('Anahtar bulunamadı.');
    }
  } catch (error) {
    console.error('Anahtar bulma hatası:', error);
    res.status(500).send('Sunucu hatası');
  }
});

