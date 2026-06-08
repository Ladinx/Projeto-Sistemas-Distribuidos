import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Restaurantes.css'

export default function Restaurantes({ onNavigate, onAdicionar, cart, user, onLogout, onLogin, onRemover, onCheckout }) {
  const [restaurantes, setRestaurantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        setLoading(true)
        const data = await api.getRestaurantes()
        setRestaurantes(data)
      } catch (err) {
        setError('Erro ao carregar restaurantes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantes()
  }, [])

  return (
    <div className="restaurantes">
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

      <section className="restaurantes__container">
        <h1 className="restaurantes__title">Nossos Restaurantes</h1>
        
        {loading && <p className="restaurantes__loading">Carregando restaurantes...</p>}
        {error && <p className="restaurantes__error">{error}</p>}

        {!loading && !error && (
          <div className="restaurantes__grid">
            {restaurantes.length > 0 ? (
              restaurantes.map((restaurante) => (
                <div key={restaurante.id} className="restaurante-card">
                  {restaurante.foto_url && (
                    <div className="restaurante-card__img" style={{ backgroundImage: `url(${restaurante.foto_url})`, height: '150px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px 8px 0 0' }} />
                  )}
                  <div className="restaurante-card__header">
                    <h2 className="restaurante-card__name">{restaurante.nome}</h2>
                  </div>

                  <div className="restaurante-card__info">
                    <p className="restaurante-card__descricao">
                      {restaurante.descricao || 'Descrição não disponível.'}
                    </p>
                    <p className="restaurante-card__endereco">
                      <strong>Endereço:</strong> {restaurante.endereco || 'N/A'}
                    </p>
                  </div>

                  <button
                    className="restaurante-card__button"
                    onClick={() => onNavigate('restaurante', restaurante.id)}
                  >
                    Ver Cardápio
                  </button>
                </div>
              ))
            ) : (
              <p className="restaurantes__empty">Nenhum restaurante encontrado</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
