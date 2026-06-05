import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Restaurantes.css'

export default function Restaurantes({ onNavigate }) {
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
      <Navbar onNavigate={onNavigate} />

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
                  <div className="restaurante-card__header">
                    <h2 className="restaurante-card__name">{restaurante.nome}</h2>
                    <span className="restaurante-card__status">
                      {restaurante.ativo ? '🟢 Aberto' : '🔴 Fechado'}
                    </span>
                  </div>

                  <div className="restaurante-card__info">
                    <p className="restaurante-card__endereco">
                      <strong>Endereço:</strong> {restaurante.endereco}
                    </p>
                    <p className="restaurante-card__telefone">
                      <strong>Telefone:</strong> {restaurante.telefone}
                    </p>
                    <p className="restaurante-card__horario">
                      <strong>Horário:</strong> {restaurante.horario_abertura} - {restaurante.horario_fechamento}
                    </p>
                  </div>

                  <button className="restaurante-card__button">
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
