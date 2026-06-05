import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Pedidos.css'

export default function Pedidos({ onNavigate }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true)
        const data = await api.getPedidos()
        setPedidos(data)
      } catch (err) {
        setError('Erro ao carregar pedidos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPedidos()
  }, [])

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pendente':
        return '#F28C38'
      case 'confirmado':
        return '#7DC142'
      case 'entregue':
        return '#7DC142'
      case 'cancelado':
        return '#D42B2B'
      default:
        return '#6b6375'
    }
  }

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pendente':
        return '⏳'
      case 'confirmado':
        return '✅'
      case 'entregue':
        return '🎉'
      case 'cancelado':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <div className="pedidos">
      <Navbar onNavigate={onNavigate} />

      <div className="ingredients-stripe">
        <div className="stripe" style={{ background: '#F5E642' }} />
        <div className="stripe" style={{ background: '#8B4513' }} />
        <div className="stripe" style={{ background: '#7DC142' }} />
        <div className="stripe" style={{ background: '#D42B2B' }} />
      </div>

      <section className="pedidos__container">
        <h1 className="pedidos__title">Meus Pedidos</h1>
        
        {loading && <p className="pedidos__loading">Carregando pedidos...</p>}
        {error && <p className="pedidos__error">{error}</p>}

        {!loading && !error && (
          <div className="pedidos__list">
            {pedidos.length > 0 ? (
              pedidos.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-card__header">
                    <div className="pedido-card__info-main">
                      <h2 className="pedido-card__number">Pedido #{pedido.id}</h2>
                      <p className="pedido-card__date">
                        {new Date(pedido.data_pedido).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span 
                      className="pedido-card__status"
                      style={{ background: getStatusColor(pedido.status) }}
                    >
                      {getStatusIcon(pedido.status)} {pedido.status}
                    </span>
                  </div>

                  <div className="pedido-card__details">
                    <p className="pedido-card__restaurante">
                      <strong>Restaurante:</strong> {pedido.restaurante_nome || 'N/A'}
                    </p>
                    <p className="pedido-card__endereco">
                      <strong>Endereço:</strong> {pedido.endereco_entrega}
                    </p>
                  </div>

                  <div className="pedido-card__items">
                    <strong>Itens:</strong>
                    {pedido.itens && Array.isArray(pedido.itens) ? (
                      <ul>
                        {pedido.itens.map((item, idx) => (
                          <li key={idx}>
                            {item.quantidade}x {item.nome} - R$ {parseFloat(item.preco).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="pedido-card__no-items">Sem itens</p>
                    )}
                  </div>

                  <div className="pedido-card__footer">
                    <div className="pedido-card__total">
                      <strong>Total:</strong> R$ {parseFloat(pedido.valor_total).toFixed(2)}
                    </div>
                    <button className="pedido-card__button">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="pedidos__empty">Nenhum pedido encontrado</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
