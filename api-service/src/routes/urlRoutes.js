const express = require('express');
const { createShortUrl, getOriginalUrl } = require('../controllers/urlController');

const router = express.Router();

router.post('/shorten', createShortUrl);
router.get('/url/:id', getOriginalUrl);

module.exports = router;
