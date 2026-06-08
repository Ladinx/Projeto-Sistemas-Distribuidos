import { useState, useRef } from 'react'
import { api } from '../api'
import './ImagePicker.css'

export default function ImagePicker({ isOpen, currentUrl, onConfirm, onCancel }) {
  const [url, setUrl] = useState(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida.')
      return
    }

    try {
      setUploading(true)
      setError(null)
      const data = await api.uploadImage(file)
      if (data.url) setUrl(data.url)
    } catch {
      setError('Erro ao fazer upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = () => {
    if (!url.trim()) {
      setError('Selecione uma imagem ou insira uma URL.')
      return
    }
    onConfirm(url.trim())
  }

  return (
    <div className="ipicker-overlay" onClick={onCancel}>
      <div className="ipicker-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ipicker-title">Imagem do produto</h2>

        <div className="ipicker-preview" onClick={() => fileInputRef.current?.click()}>
          {url ? (
            <img src={url} alt="Preview" className="ipicker-preview__img" />
          ) : (
            <span className="ipicker-preview__placeholder">Clique para selecionar</span>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="ipicker-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Fazer upload'}
        </button>

        <div className="ipicker-divider">
          <span>ou</span>
        </div>

        <label className="ipicker-url-label">URL da imagem</label>
        <input
          type="text"
          className="ipicker-url-input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {error && <p className="ipicker-error">{error}</p>}

        <div className="ipicker-actions">
          <button type="button" className="ipicker-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="ipicker-confirm"
            onClick={handleConfirm}
            disabled={uploading}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
