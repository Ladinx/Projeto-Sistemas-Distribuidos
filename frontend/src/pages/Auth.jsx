import { useState } from 'react'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Auth({ onNavigate, onLogin, onRegister, authView, user }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    tipo: 'cliente',
    descricao: '',
    endereco: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (authView === 'login') {
        await onLogin({ email: formData.email, senha: formData.senha })
      } else {
        await onRegister(formData)
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Erro ao processar autenticação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <Navbar
        onNavigate={onNavigate}
        carrinho={[]}
        onRemover={() => {}}
        user={user}
        onLogin={() => onNavigate('auth', 'login')}
      />

      <div className="ingredients-stripe">
        <div className="stripe" style={{ background: '#F5E642' }} />
        <div className="stripe" style={{ background: '#8B4513' }} />
        <div className="stripe" style={{ background: '#7DC142' }} />
        <div className="stripe" style={{ background: '#D42B2B' }} />
      </div>

      <section className="auth__container">
        <div className="auth__box">
          <h1 className="auth__title">{authView === 'login' ? 'Entrar' : 'Cadastrar'}</h1>
          
          <div className="auth__tabs">
            <button
              type="button"
              className={`auth__tab ${authView === 'login' ? 'auth__tab--active' : ''}`}
              onClick={() => onNavigate('auth', 'login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth__tab ${authView === 'register' ? 'auth__tab--active' : ''}`}
              onClick={() => onNavigate('auth', 'register')}
            >
              Cadastro
            </button>
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            {authView === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="nome" className="form-label">Nome</label>
                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipo" className="form-label">Tipo de usuário</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="restaurante">Restaurante</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha" className="form-label">Senha</label>
              <input
                id="senha"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {authView === 'register' && formData.tipo === 'restaurante' && (
              <>
                <div className="form-group">
                  <label htmlFor="descricao" className="form-label">Descrição</label>
                  <input
                    id="descricao"
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endereco" className="form-label">Endereço</label>
                  <input
                    id="endereco"
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </>
            )}

            {error && <div className="auth__error">{error}</div>}
            
            <button
              type="submit"
              disabled={loading}
              className="auth__submit"
            >
              {loading ? 'Enviando...' : authView === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
