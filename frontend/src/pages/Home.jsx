import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Home.css'

function Card({ item, onAdicionar }) {
  return (
    <div className="destaque-card">
      <div className="destaque-card__img" style={{ backgroundImage: `url(${item.produto_foto})` }} />
      <div className="destaque-card__body">
        <h3 className="destaque-card__nome">{item.produto_nome}</h3>
        <span className="destaque-card__preco">R$ {parseFloat(item.preco).toFixed(2)}</span>
        <div className="destaque-card__restaurante">
          {item.restaurante_foto && (
            <img src={item.restaurante_foto} alt="" className="destaque-card__restaurante-avatar" />
          )}
          <span>{item.restaurante_nome}</span>
        </div>
        <button
          className="destaque-card__add"
          onClick={() => onAdicionar && onAdicionar({
            produto_id: item.id ?? item.produto_id,
            nome: item.produto_nome,
            preco: parseFloat(item.preco),
            imagem: item.produto_foto,
            restaurante_id: item.restaurante_id,
            quantidade: 1,
          })}
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  )
}

export default function Home({ onNavigate, onAdicionar, cart, user, onLogout, onLogin, onRemover, onCheckout }) {
  const [maisPedidos, setMaisPedidos] = useState([])
  const [destaques, setDestaques] = useState([])

  useEffect(() => {
    api.getDestaques()
      .then(setDestaques)
      .catch(() => setDestaques([]))
  }, [])

  useEffect(() => {
    api.getMaisPedidos()
      .then(setMaisPedidos)
      .catch(() => setMaisPedidos([]))
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
        <h2 className="section-title">Destaques</h2>
        <div className="destaques-grid">
          {destaques.length > 0 ? destaques.map((item) => (
            <Card key={item.id} item={item} onAdicionar={onAdicionar} />
          )) : (
            <>
              <div className="card-placeholder" />
              <div className="card-placeholder" />
              <div className="card-placeholder" />
              <div className="card-placeholder" />
            </>
          )}
        </div>
      </section>

      {maisPedidos.length > 0 && (
        <section className="orange-section">
          <h2 className="section-title">Mais Pedidos</h2>
          <div className="destaques-grid">
            {maisPedidos.map((item) => (
              <Card key={item.id} item={item} onAdicionar={onAdicionar} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
