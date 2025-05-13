const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { VIDEOS_BASE_PATH } = require('../utils/paths');
const { log } = require('../utils/logger');

router.get('/folders', (req, res) => {
  log('folders', null, 'groupCollapsed');

  try {
    const folders = fs.readdirSync(VIDEOS_BASE_PATH)
      .filter(name => fs.lstatSync(path.join(VIDEOS_BASE_PATH, name)).isDirectory());

    log('folders', `Pastas encontradas: ${folders.length}`, 'info');
    res.status(200).json({ folders });
  } catch (err) {
    log('folders', `Erro ao listar pastas: ${err.message}`, 'error');
    res.status(500).send('Erro ao listar pastas');
  }

  log('folders', null, 'end');
});

module.exports = router;
