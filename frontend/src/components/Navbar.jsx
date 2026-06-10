import { useState } from 'react'
import { FiShoppingCart, FiX, FiTrash2, FiLogIn, FiLogOut } from 'react-icons/fi'
import './Navbar.css'
import CheckoutModal from './CheckoutModal'

export default function Navbar({ carrinho = [], onRemover, onNavigate, user, onLogout, onLogin, onCheckout }) {
  const [aberto, setAberto] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const total = carrinho.reduce(
    (acc, item) => acc + (parseFloat(item.preco) || 0) * (item.quantidade || 1),
    0
  )
  const hasCheckout = carrinho.some((item) => item.produto_id && item.restaurante_id)

  return (
    <div className="navbar__wrapper">
      <nav className="navbar">
        <div className="navbar__logo" onClick={() => onNavigate?.('home')}>
          Burguers n' Rides
          <span>CWB</span>
        </div>
        
        <div className="navbar__burger-container" onClick={() => onNavigate?.('home')}>
          <svg className="navbar__burger" viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
            <g className="steam steam-1">
              <path d="M 30 10 Q 28 5 30 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
            </g>
            <g className="steam steam-2">
              <path d="M 50 8 Q 48 3 50 -2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
            </g>
            <g className="steam steam-3">
              <path d="M 70 12 Q 68 7 70 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
            </g>
            <path d="M 20 28 Q 20 12 50 8 Q 80 12 80 28 L 80 30 Q 80 28 50 26 Q 20 28 20 30 Z" fill="#E8B88A"/>
            <ellipse cx="50" cy="26" rx="30" ry="10" fill="#D4A574"/>
            <path d="M 25 22 Q 50 18 75 22" stroke="#C89968" strokeWidth="0.8" fill="none" opacity="0.5"/>
            <circle cx="35" cy="22" r="1.5" fill="#F5E642"/>
            <circle cx="45" cy="19" r="1.5" fill="#F5E642"/>
            <circle cx="55" cy="20" r="1.5" fill="#F5E642"/>
            <circle cx="65" cy="22" r="1.5" fill="#F5E642"/>
            <circle cx="40" cy="16" r="1.5" fill="#F5E642"/>
            <circle cx="60" cy="17" r="1.5" fill="#F5E642"/>
            <circle cx="50" cy="24" r="1" fill="#F5E642"/>
            <path d="M 20 32 Q 20 28 50 27 Q 80 28 80 32 Z" fill="#7DC142" opacity="0.85"/>
            <path d="M 22 31 Q 25 29 50 28 Q 75 29 78 31" stroke="#6BA838" strokeWidth="0.5" fill="none" opacity="0.6"/>
            <rect x="22" y="33" width="56" height="6" fill="#F5E642" rx="1"/>
            <path d="M 22 33 Q 50 34 78 33" stroke="#E8D72B" strokeWidth="0.5" opacity="0.6"/>
            <rect x="20" y="40" width="60" height="10" fill="#8B4513" rx="2"/>
            <circle cx="35" cy="45" r="1.5" fill="#A0522D" opacity="0.6"/>
            <circle cx="55" cy="45" r="1.5" fill="#A0522D" opacity="0.6"/>
            <circle cx="45" cy="47" r="1.5" fill="#A0522D" opacity="0.6"/>
            <path d="M 22 40 L 78 41" stroke="#6B3410" strokeWidth="0.5" opacity="0.5"/>
            <rect x="20" y="52" width="60" height="8" fill="#E8B88A" rx="1"/>
            <path d="M 22 52 L 78 52" stroke="#D4A574" strokeWidth="0.5" opacity="0.6"/>
            <path d="M 25 60 Q 50 64 75 60" stroke="#C89968" strokeWidth="0.8" fill="none" opacity="0.4"/>
          </svg>
        </div>

        <ul className="navbar__links">
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('pedidos') }}>Pedidos</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('restaurantes') }}>Restaurantes</a></li>
          {user && (
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('perfil') }}>Meu Perfil</a></li>
          )}
          <li>
            <button className="navbar__cart-btn" onClick={() => setAberto(true)}>
              <FiShoppingCart size={22} />
              {carrinho.length > 0 && (
                <span className="navbar__cart-badge">{carrinho.length}</span>
              )}
            </button>
          </li>
          <li>
            {user ? (
              <div className="navbar__user-menu">
                {user.foto_url && (
                  <img src={user.foto_url} alt="Perfil" className="navbar__user-photo" />
                )}
                <button className="navbar__auth-btn" onClick={onLogout}>
                  <FiLogOut size={18} /> Sair
                </button>
              </div>
            ) : (
              <button className="navbar__auth-btn" onClick={() => onLogin && onLogin()}>
                <FiLogIn size={18} /> Entrar
              </button>
            )}
          </li>
        </ul>
      </nav>

      <div className="ingredients-stripe">
        <div className="stripe" style={{ background: '#F5E642' }} />
        <div className="stripe" style={{ background: '#8B4513' }} />
        <div className="stripe" style={{ background: '#7DC142' }} />
        <div className="stripe" style={{ background: '#D42B2B' }} />
      </div>

      {aberto && (
        <>
          <div className="cart-overlay" onClick={() => setAberto(false)} />
          <div className="cart-drawer cart-drawer--open">
            <div className="cart-drawer__header">
              <span>Carrinho</span>
              <button onClick={() => setAberto(false)}><FiX size={20} /></button>
            </div>
            {carrinho.length === 0 ? (
              <p className="cart-drawer__empty">Nenhum item ainda.</p>
            ) : (
              <>
                <ul className="cart-drawer__list">
                  {carrinho.map((item, i) => (
                    <li key={i} className="cart-drawer__item">
                      <span>{item.nome} x{item.quantidade}</span>
                      <div className="cart-drawer__item-right">
                        <span>R$ {(parseFloat(item.preco) || 0).toFixed(2)}</span>
                        <button onClick={() => onRemover && onRemover(i)}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                  <li className="cart-drawer__actions">
                    <button
                      className="cart-drawer__checkout"
                      disabled={!hasCheckout}
                      onClick={() => {
                        if (!hasCheckout) return
                        setShowCheckout(true)
                      }}
                    >
                      Finalizar pedido
                    </button>
                    {!hasCheckout && (
                      <p className="cart-drawer__hint">
                        Adicione produtos do cardápio de um restaurante para finalizar.
                      </p>
                    )}
                  </li>
                </ul>
                <div className="cart-drawer__total">
                  Total: <strong>R$ {total.toFixed(2)}</strong>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {showCheckout && (
        <CheckoutModal
          user={user}
          onClose={() => setShowCheckout(false)}
          onConfirm={({ endereco, pagamento, troco }) => {
            onCheckout && onCheckout(endereco, pagamento, troco)
            setShowCheckout(false)
            setAberto(false)
          }}
        />
      )}
    </div>
  )
}