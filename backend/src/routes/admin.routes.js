const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: '✅ Admin routes funcionando' });
});

module.exports = router;