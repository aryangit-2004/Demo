const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

const notifications = [
  { id: 1, message: 'New message received', read: false },
  { id: 2, message: 'Task assigned to you', read: false }
];

app.use(express.json());

app.get('/notifications', (req, res) => {
  res.json(notifications);
});

app.patch('/notifications/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id);
  const notification = notifications.find(n => n.id === notificationId);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.read = true;
  res.json({ message: 'Notification marked as read' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.delete('/notifications/:id', (req, res) => {
  const notificationId = parseInt(req.params.id);
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);

  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notifications.splice(notificationIndex, 1);
  res.json({ message: 'Notification deleted' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
