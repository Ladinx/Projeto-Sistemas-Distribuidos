import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import './Home.css'

export default function Home({
  onNavigate,
  onAdicionar,
  cart,
  user,
  onLogout,
  onLogin,
  onRemover,
  onCheckout
}) {
  const [destaques, setDestaques] = useState([])
  const [maisPedidos, setMaisPedidos] = useState([])

  useEffect(() => {
    api.getDestaques()
      .then(setDestaques)
      .catch(() => setDestaques([]))
  }, [])

  useEffect(() => {
    if (user?.tipo === 'cliente') {
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

            <button
              className="hero__cta"
              onClick={() => onNavigate('restaurantes')}
            >
              Ver restaurantes
            </button>
          </div>
        </div>
      </section>

      <section className="orange-section">

        {/* Imagens fixas */}
        <div className="orange-section__featured-container">
          <img
            src="/hambuguer.webp"
            alt="Hambúrguer destaque"
            className="orange-section__featured-img"
          />

          <img
            src="/batatas.jpg"
            alt="Batatas destaque"
            className="orange-section__featured-img"
          />
        </div>

        {/* Cards vindos da rota */}
        <div className="orange-section__frequent">
          <h2 className="frequent__title">Destaques:</h2>

          <div className="frequent__grid">
            {destaques.map((item) => (
              <div key={item.id} className="destaque-card">
                <div
                  className="destaque-card__img"
                  style={{
                    backgroundImage: `url(${item.produto_foto})`
                  }}
                />

                <div className="destaque-card__body">
                  <h3 className="destaque-card__nome">
                    {item.produto_nome}
                  </h3>

                  <span className="destaque-card__preco">
                    R$ {parseFloat(item.preco).toFixed(2)}
                  </span>

                  <div className="destaque-card__restaurante">
                    {item.restaurante_foto && (
                      <img
                        src={item.restaurante_foto}
                        alt=""
                        className="destaque-card__restaurante-avatar"
                      />
                    )}

                    <span>{item.restaurante_nome}</span>
                  </div>

                  <button
                    className="destaque-card__add"
                    onClick={() =>
                      onAdicionar?.({
                        produto_id: item.id,
                        nome: item.produto_nome,
                        preco: parseFloat(item.preco),
                        imagem: item.produto_foto,
                        restaurante_id: item.restaurante_id,
                        quantidade: 1
                      })
                    }
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mais pedidos do cliente */}
        {maisPedidos.length > 0 && (
          <div className="orange-section__frequent">
            <h2 className="frequent__title">
              Pedidos com frequência:
            </h2>

            <div className="frequent__grid">
              {maisPedidos.map((item) => (
                <div
                  key={item.produto_id}
                  className="destaque-card"
                >
                  <div
                    className="destaque-card__img"
                    style={{
                      backgroundImage: `url(${item.produto_foto})`
                    }}
                  />

                  <div className="destaque-card__body">
                    <h3 className="destaque-card__nome">
                      {item.produto_nome}
                    </h3>

                    <span className="destaque-card__preco">
                      R$ {parseFloat(item.preco).toFixed(2)}
                    </span>

                    <button
                      className="destaque-card__add"
                      onClick={() =>
                        onAdicionar?.({
                          produto_id: item.produto_id,
                          nome: item.produto_nome,
                          preco: parseFloat(item.preco),
                          imagem: item.produto_foto,
                          restaurante_id: item.restaurante_id,
                          quantidade: 1
                        })
                      }
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </div>
  )
}