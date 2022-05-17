const express = require('express');
const path = require('path');

const router = express.Router();

// GET /user 라우터
router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

module.exports = router;