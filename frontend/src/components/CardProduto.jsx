import './CardProduto.css'

export default function CardProduto({ nome, preco, imagem, onAdicionar }) {
  return (
    <div className="card-produto">
      <div
        className="card-produto__img"
        style={imagem ? { backgroundImage: `url(${imagem})` } : {}}
      >
        {!imagem && <span className="card-produto__img-placeholder">🍔</span>}
        <span className="card-produto__preco">R$ {preco}</span>
      </div>
      <div className="card-produto__footer">
        <span className="card-produto__nome">{nome}</span>
        <button
          className="card-produto__btn"
          onClick={() => onAdicionar && onAdicionar({ nome, preco, imagem })}
          aria-label={`Adicionar ${nome} ao carrinho`}
        >
          +
        </button>
      </div>
    </div>
  )
}
