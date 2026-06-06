import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Restaurantes.css'

export default function Restaurante({ restaurantId, onNavigate, onAdicionar, cart, user, onLogout, onLogin, onRemover, onCheckout }) {
  const [restaurante, setRestaurante] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // form novo produto
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '' })
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const isDono = user && restaurante && user.id === restaurante.id

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        const [restaurantData, produtosData] = await Promise.all([
          api.getRestaurante(restaurantId),
          api.getProdutos(restaurantId),
        ])
        setRestaurante(restaurantData)
        setProdutos(produtosData)
      } catch (err) {
        setError('Erro ao carregar restaurante e cardápio.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) fetchRestaurant()
  }, [restaurantId])

  const handleAddProduto = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.nome || !form.preco) {
      setFormError('Nome e preço são obrigatórios.')
      return
    }
    try {
      setFormLoading(true)
      const novo = await api.createProduto(restaurantId, {
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
      })
      setProdutos((prev) => [novo, ...prev])
      setForm({ nome: '', descricao: '', preco: '' })
    } catch (err) {
      setFormError('Erro ao criar produto.')
      console.error(err)
    } finally {
      setFormLoading(false)
    }
  }

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
        <button className="restaurante-back" onClick={() => onNavigate('restaurantes')}>
          Voltar para restaurantes
        </button>

        {loading && <p className="restaurantes__loading">Carregando cardápio...</p>}
        {error && <p className="restaurantes__error">{error}</p>}

        {!loading && !error && restaurante && (
          <>
            <div className="restaurante-detail">
              <h1>{restaurante.nome}</h1>
              <p>{restaurante.descricao || 'Descrição não disponível.'}</p>
              <p><strong>Categoria:</strong> {restaurante.categoria || 'Geral'}</p>
              <p><strong>Endereço:</strong> {restaurante.endereco || 'N/A'}</p>
            </div>

            {isDono && (
              <form className="produto-form" onSubmit={handleAddProduto}>
                <h3>Adicionar produto ao cardápio</h3>
                {formError && <p className="produto-form__error">{formError}</p>}
                <input
                  type="text"
                  placeholder="Nome do produto *"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Preço *"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                />
                <button type="submit" disabled={formLoading}>
                  {formLoading ? 'Adicionando...' : 'Adicionar produto'}
                </button>
              </form>
            )}

            <div className="restaurantes__grid">
              {produtos.length > 0 ? (
                produtos.map((produto) => (
                  <div key={produto.id} className="restaurante-card">
                    <div className="restaurante-card__header">
                      <h2 className="restaurante-card__name">{produto.nome}</h2>
                      <span className="restaurante-card__status">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                    </div>
                    <div className="restaurante-card__info">
                      <p>{produto.descricao || 'Sem descrição'}</p>
                    </div>
                    <button
                      className="restaurante-card__button"
                      onClick={() => onAdicionar && onAdicionar({
                        produto_id: produto.id,
                        nome: produto.nome,
                        preco: parseFloat(produto.preco),
                        restaurante_id: restaurantId,
                        quantidade: 1,
                      })}
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>
                ))
              ) : (
                <p className="restaurantes__empty">Nenhum produto disponível.</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}