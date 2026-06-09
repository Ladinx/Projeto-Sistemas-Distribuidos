import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import CardProduto from '../components/CardProduto'
import { api } from '../api'
import './Home.css'

export default function Home({ onNavigate, onAdicionar, cart, user, onLogout, onLogin, onRemover, onCheckout }) {
  const [frequentes, setFrequentes] = useState([])

  const PLACEHOLDER = [
  { id: 'p1', nome: 'Smash Clássico', preco: 28 },
  { id: 'p2', nome: 'Double Bacon', preco: 34 },
  { id: 'p3', nome: 'BBQ Cheddar', preco: 31 },
  { id: 'p4', nome: 'Crispy Frango', preco: 29 },
]

useEffect(() => {
  const fetchFrequentes = async () => {
    try {
      const restaurantes = await api.getRestaurantes()
      const produtos = await Promise.all(
        restaurantes.slice(0, 4).map((r) => api.getProdutos(r.id))
      )
      const todos = produtos.flat()
      setFrequentes(todos.length > 0 ? todos.slice(0, 4) : PLACEHOLDER)
    } catch (err) {
      setFrequentes(PLACEHOLDER)
      console.error(err)
    }
  }
  fetchFrequentes()
}, [])

  return (
    <div className="home">
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

      <section className="hero">
        <video
          className="hero__video"
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero__content">
          <div className="hero__text">
            <h1>Entrega rápida<br />pra sua fome.</h1>
            <p>Os melhores smash burgers de Curitiba,<br />direto na sua porta.</p>
            <button className="hero__cta" onClick={() => onNavigate('restaurantes')}>
              Ver restaurantes
            </button>
          </div>
        </div>
      </section>

      <section className="orange-section">
        <div className="orange-section__featured-container">
          <img src="/hambuguer.webp" alt="Hambúrguer destaque" className="orange-section__featured-img" />
          <img src="/batatas.jpg" alt="Batatas destaque" className="orange-section__featured-img" />
        </div>

        <div className="orange-section__frequent">
          <h2 className="frequent__title">Pedidos com frequência:</h2>
          <div className="frequent__grid">
            {frequentes.map((produto) => (
              <CardProduto
                key={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                imagem={produto.imagem}
                onAdicionar={() => onAdicionar && onAdicionar({
                  produto_id: produto.id,
                  nome: produto.nome,
                  preco: parseFloat(produto.preco),
                  restaurante_id: produto.restaurante_id,
                  quantidade: 1,
                })}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}