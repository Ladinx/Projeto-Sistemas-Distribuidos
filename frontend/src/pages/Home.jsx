import Navbar from '../components/Navbar'
import CardProduto from '../components/CardProduto'
import './Home.css'

// Mock data — trocar por chamada à API depois
const PEDIDOS_FREQUENTES = [
  { id: 1, nome: 'Smash Clássico', preco: 28 },
  { id: 2, nome: 'Double Bacon',   preco: 34 },
  { id: 3, nome: 'BBQ Cheddar',    preco: 31 },
  { id: 4, nome: 'Crispy Frango',  preco: 29 },
]

export default function Home({ onNavigate }) {
  function handleAdicionar(produto) {
    // TODO: integrar com contexto do carrinho
    console.log('Adicionado ao carrinho:', produto)
  }

  return (
    <div className="home">
      <Navbar onNavigate={onNavigate} />

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
      <button className="hero__cta">Ver restaurantes</button>
    </div>
  </div>
</section>

      <section className="orange-section">
        <div className="orange-section__featured-container">
          <div className="orange-section__featured">
            {/* Trocar por <img src="..." alt="..." /> quando tiver a imagem */}
            imagem destaque 1
          </div>
          <div className="orange-section__featured">
            {/* Trocar por <img src="..." alt="..." /> quando tiver a imagem */}
            imagem destaque 2
          </div>
        </div>

        <div className="orange-section__frequent">
          <h2 className="frequent__title">Pedidos com frequência:</h2>
          <div className="frequent__grid">
            {PEDIDOS_FREQUENTES.map((produto) => (
              <CardProduto
                key={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                imagem={produto.imagem}
                onAdicionar={handleAdicionar}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
