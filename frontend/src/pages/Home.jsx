import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import CardProduto from '../components/CardProduto'
import { api } from '../api'
import './Home.css'

export default function Home({ onNavigate, onAdicionar, cart, user, onLogout, onLogin, onRemover, onCheckout }) {
  const [maisPedidos, setMaisPedidos] = useState([])

  useEffect(() => {
    if (user && user.tipo === 'cliente') {
      api.getMaisPedidos()
        .then(setMaisPedidos)
        .catch(() => setMaisPedidos([]))
    } else {
      setMaisPedidos([])
    }
  }, [user])

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
          <div className="orange-section__featured">imagem destaque 1</div>
          <div className="orange-section__featured">imagem destaque 2</div>
        </div>

        {maisPedidos.length > 0 && (
          <div className="orange-section__frequent">
            <h2 className="frequent__title">Pedidos com frequencia:</h2>
            <div className="frequent__grid">
              {maisPedidos.map((item) => (
                <CardProduto
                  key={item.produto_id}
                  nome={item.produto_nome}
                  preco={parseFloat(item.preco)}
                  produto_id={item.produto_id}
                  restaurante_id={item.restaurante_id}
                  onAdicionar={() => onAdicionar && onAdicionar({
                    produto_id: item.produto_id,
                    nome: item.produto_nome,
                    preco: parseFloat(item.preco),
                    restaurante_id: item.restaurante_id,
                    quantidade: 1,
                  })}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
