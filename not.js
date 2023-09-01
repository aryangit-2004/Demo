const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect('mongodb://localhost/your_custom_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());

const customNotificationSchema = new mongoose.Schema({
  message: String,
  timestamp: Date,

});

const CustomNotification = mongoose.model('CustomNotification', customNotificationSchema);

app.get('/api/custom-notifications', async (req, res) => {
  try {
    const customNotifications = await CustomNotification.find().sort({ timestamp: -1 });
    res.json(customNotifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/custom-notifications', async (req, res) => {
  try {
    const { message } = req.body;
    const newCustomNotification = new CustomNotification({ message, timestamp: new Date() });
    await newCustomNotification.save();
    res.status(201).json(newCustomNotification);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
