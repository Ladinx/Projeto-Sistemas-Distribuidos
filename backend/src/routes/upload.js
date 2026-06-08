const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';

/**
 * @openapi
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Faz upload de uma imagem e retorna a URL hospedada
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
  }

  try {
    const formData = new FormData();
    formData.append('key', FREEIMAGE_API_KEY);
    formData.append('action', 'upload');
    
    const base64Image = req.file.buffer.toString('base64');
    formData.append('source', base64Image);
    formData.append('format', 'json');

    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.status_code !== 200) {
      console.error('Erro na API de imagem:', data);
      return res.status(500).json({ error: 'Erro ao processar imagem no servidor externo.' });
    }

    return res.status(200).json({
      url: data.image.url,
      thumb: data.image.thumb.url
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return res.status(500).json({ error: 'Erro interno ao fazer upload da imagem.' });
  }
});

module.exports = router;