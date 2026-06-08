import { useState } from 'react';
import Navbar from '../components/Navbar';
import ImagePicker from '../components/ImagePicker';
import { api } from '../api';
import './Perfil.css';

export default function Perfil({ onNavigate, user, onLogin, onLogout, cart = [], onRemover, onCheckout, setUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    descricao: user?.descricao || '',
    endereco: user?.endereco || '',
    foto_url: user?.foto_url || '',
  });

  if (!user) {
    return (
      <div className="perfil">
        <Navbar
          onNavigate={onNavigate}
          carrinho={cart}
          onRemover={onRemover}
          onCheckout={onCheckout}
          user={user}
          onLogout={onLogout}
          onLogin={onLogin}
        />
        <div className="perfil__container">
          <p>Você precisa estar logado para ver esta página.</p>
          <button onClick={() => onLogin()}>Fazer Login</button>
        </div>
      </div>
    );
  }

  const isRestaurante = user.tipo === 'restaurante';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await api.updateProfile(formData);
      // Atualiza o estado global do usuário no App.jsx
      if (setUser) setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil">
      <Navbar
        onNavigate={onNavigate}
        carrinho={cart}
        onRemover={onRemover}
        onCheckout={onCheckout}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
      />

      <div className="ingredients-stripe">
        <div className="stripe" style={{ background: '#F5E642' }} />
        <div className="stripe" style={{ background: '#8B4513' }} />
        <div className="stripe" style={{ background: '#7DC142' }} />
        <div className="stripe" style={{ background: '#D42B2B' }} />
      </div>

      <section className="perfil__container">
        <div className="perfil__box">
          <h1 className="perfil__title">Meu Perfil</h1>

          <div className="perfil__photo-section">
            <div
              className="perfil__photo-picker"
              onClick={() => setShowPicker(true)}
            >
              <div
                className="perfil__photo-preview"
                style={{ backgroundImage: formData.foto_url ? `url(${formData.foto_url})` : 'none' }}
              >
                {!formData.foto_url && <span>Sem foto</span>}
              </div>
              <button type="button" className="perfil__photo-btn">
                Alterar foto
              </button>
            </div>
          </div>

          <ImagePicker
            isOpen={showPicker}
            currentUrl={formData.foto_url}
            onConfirm={(url) => {
              setFormData((prev) => ({ ...prev, foto_url: url }));
              setShowPicker(false);
            }}
            onCancel={() => setShowPicker(false)}
          />

          <form className="perfil__form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (não alterável)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="form-input form-input--disabled"
              />
            </div>

            {isRestaurante && (
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Endereço de entrega</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {error && <div className="perfil__message perfil__error">{error}</div>}
            {success && <div className="perfil__message perfil__success">{success}</div>}
            
            <button
              type="submit"
              disabled={loading}
              className="perfil__submit"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}