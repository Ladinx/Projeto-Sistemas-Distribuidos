import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Pedidos.css'

const STATUS_FLOW = ['pendente', 'preparando', 'em_entrega', 'entregue']

const STATUS_LABELS = {
  pendente: '⏳ Pendente',
  preparando: '👨‍🍳 Preparando',
  em_entrega: '🛵 Em entrega',
  entregue: '✅ Entregue',
  cancelado: '❌ Cancelado',
}

const STATUS_COLORS = {
  pendente: '#F28C38',
  preparando: '#7B2FBE',
  em_entrega: '#1a91d1',
  entregue: '#7DC142',
  cancelado: '#D42B2B',
}

export default function Pedidos({ onNavigate, user, onLogin, onLogout, cart = [], onRemover, onCheckout }) {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setPedidos([])
      return
    }

    const fetchPedidos = async () => {
      try {
        setLoading(true)
        const lista = await api.getPedidos()
        const detalhes = await Promise.all(lista.map((p) => api.getPedido(p.id)))
        setPedidos(detalhes)
      } catch (err) {
        setError('Erro ao carregar pedidos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPedidos()
  }, [user])

  const handleAvancarStatus = async (pedido) => {
    const currentIndex = STATUS_FLOW.indexOf(pedido.status)
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return
    const novoStatus = STATUS_FLOW[currentIndex + 1]

    try {
      setUpdatingId(pedido.id)
      await api.updatePedidoStatus(pedido.id, { status: novoStatus })
      setPedidos((prev) =>
        prev.map((p) => p.id === pedido.id ? { ...p, status: novoStatus } : p)
      )
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCancelar = async (pedido) => {
    try {
      setUpdatingId(pedido.id)
      await api.updatePedidoStatus(pedido.id, { status: 'cancelado' })
      setPedidos((prev) =>
        prev.map((p) => p.id === pedido.id ? { ...p, status: 'cancelado' } : p)
      )
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const isRestaurante = user?.tipo === 'restaurante'

  return (
    <div className="pedidos">
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

      <section className="pedidos__container">
        <h1 className="pedidos__title">{isRestaurante ? 'Pedidos Recebidos' : 'Meus Pedidos'}</h1>

        {!user && (
          <div className="pedidos__not-logged">
            <p>Faça login para ver seus pedidos.</p>
            <button className="pedidos__login-button" onClick={() => onLogin()}>Entrar</button>
          </div>
        )}

        {user && loading && <p className="pedidos__loading">Carregando pedidos...</p>}
        {user && error && <p className="pedidos__error">{error}</p>}

        {user && !loading && !error && (
          <div className="pedidos__list">
            {pedidos.length > 0 ? (
              pedidos.map((pedido) => {
                const currentIndex = STATUS_FLOW.indexOf(pedido.status)
                const podeAvancar = isRestaurante && currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
                const podeCancelar = isRestaurante && pedido.status !== 'cancelado' && pedido.status !== 'entregue'

                return (
                  <div key={pedido.id} className="pedido-card">
                    <div className="pedido-card__header">
                      <div className="pedido-card__info-main">
                        <h2 className="pedido-card__number">Pedido #{pedido.id}</h2>
                        <p className="pedido-card__date">
                          {new Date(pedido.criado_em || pedido.data_pedido).toLocaleDateString('pt-BR', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="pedido-card__status" style={{ background: STATUS_COLORS[pedido.status] || '#6b6375' }}>
                        {STATUS_LABELS[pedido.status] || pedido.status}
                      </span>
                    </div>

                    <div className="pedido-card__details">
                      <p className="pedido-card__restaurante">
                        <strong>{isRestaurante ? 'Cliente' : 'Restaurante'}:</strong>{' '}
                        {isRestaurante ? pedido.cliente_nome : pedido.restaurante_nome || 'N/A'}
                      </p>
                      <p className="pedido-card__endereco">
                        <strong>Endereço:</strong> {pedido.endereco_entrega || 'N/A'}
                      </p>
                    </div>

                    <div className="pedido-card__items">
                      <strong>Itens:</strong>
                      {pedido.itens && Array.isArray(pedido.itens) ? (
                        <ul>
                          {pedido.itens.map((item, idx) => (
                            <li key={idx}>
                              {item.quantidade}x {item.produto_nome || item.nome || 'Item'} — R$ {parseFloat(item.preco_unitario || item.preco || 0).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="pedido-card__no-items">Sem itens</p>
                      )}
                    </div>

                    <div className="pedido-card__footer">
                      <div className="pedido-card__total">
                        <strong>Total:</strong> R$ {parseFloat(pedido.total || pedido.valor_total || 0).toFixed(2)}
                      </div>
                      {isRestaurante && (
                        <div className="pedido-card__actions">
                          {podeAvancar && (
                            <button
                              className="pedido-card__btn-avancar"
                              disabled={updatingId === pedido.id}
                              onClick={() => handleAvancarStatus(pedido)}
                            >
                              {updatingId === pedido.id ? '...' : `→ ${STATUS_LABELS[STATUS_FLOW[currentIndex + 1]]}`}
                            </button>
                          )}
                          {podeCancelar && (
                            <button
                              className="pedido-card__btn-cancelar"
                              disabled={updatingId === pedido.id}
                              onClick={() => handleCancelar(pedido)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="pedidos__empty">Nenhum pedido encontrado</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}