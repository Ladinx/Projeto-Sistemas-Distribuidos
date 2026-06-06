import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Restaurantes from './pages/Restaurantes'
import Restaurante from './pages/Restaurante'
import Pedidos from './pages/Pedidos'
import Auth from './pages/Auth'
import { api } from './api'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null)
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login')
  const [loadingUser, setLoadingUser] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const token = api.getToken()
      if (!token) return

      try {
        setLoadingUser(true)
        const authenticatedUser = await api.me()
        setUser(authenticatedUser)
      } catch (err) {
        api.logout()
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [])

  const navigate = (page, payload = null) => {
    setCurrentPage(page)
    if (page === 'restaurante') {
      setSelectedRestaurantId(payload)
    } else {
      setSelectedRestaurantId(null)
    }
    if (page === 'auth') {
      setAuthView(payload || 'login')
    }
  }

  const handleAddToCart = (item) => {
    setMessage(null)

    const restaurantIdInCart = cart.find((cartItem) => cartItem.restaurante_id)?.restaurante_id
    if (restaurantIdInCart && item.restaurante_id && item.restaurante_id !== restaurantIdInCart) {
      setMessage('O carrinho só pode conter produtos de um único restaurante. Remova os itens antigos ou finalize o pedido primeiro.')
      return
    }

    const index = cart.findIndex((cartItem) => {
      if (item.produto_id && cartItem.produto_id) {
        return cartItem.produto_id === item.produto_id
      }
      return cartItem.nome === item.nome
    })

    if (index >= 0) {
      setCart((prevCart) => {
        const nextCart = [...prevCart]
        nextCart[index] = {
          ...nextCart[index],
          quantidade: (nextCart[index].quantidade || 1) + 1,
        }
        return nextCart
      })
      return
    }

    setCart((prevCart) => [
      ...prevCart,
      {
        ...item,
        quantidade: item.quantidade || 1,
      },
    ])
  }

  const handleRemoveFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index))
  }

  const handleLogin = async (credentials) => {
    try {
      const response = await api.login(credentials)
      api.setToken(response.token)
      setUser(response.usuario)
      setMessage(null)
      navigate('home')
    } catch (error) {
      throw error
    }
  }

  const handleRegister = async (registrationData) => {
    try {
      await api.register(registrationData)
      await handleLogin({
        email: registrationData.email,
        senha: registrationData.senha,
      })
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    api.logout()
    setUser(null)
    navigate('home')
  }

  const handleCheckout = async (endereco_entrega, pagamento, troco) => {
  if (!user) {
    navigate('auth', 'login')
    return
  }

  const items = cart.filter((item) => item.produto_id && item.quantidade > 0)
  const restauranteId = items[0]?.restaurante_id

  if (!restauranteId || items.length === 0) {
    setMessage('Adicione produtos do cardápio de um restaurante antes de finalizar o pedido.')
    return
  }

  try {
    const enderecoFinal = pagamento === 'dinheiro' && troco
      ? `${endereco_entrega} | Troco para: R$ ${troco}`
      : endereco_entrega

    const pedido = await api.createPedido({
      restaurante_id: restauranteId,
      itens: items.map((item) => ({ produto_id: item.produto_id, quantidade: item.quantidade })),
      endereco_entrega: enderecoFinal,
    })

    if (pagamento !== 'dinheiro') {
      await api.createPagamento(pedido.id, { metodo: pagamento })
    }

    setCart([])
    navigate('pedidos')
    setMessage('Pedido criado com sucesso!')
    setTimeout(() => setMessage(null), 4000)
  } catch (error) {
    setMessage(error?.error || 'Erro ao finalizar pedido.')
    console.error(error)
  }
}

  return (
    <>
      {message && <div className="app__message">{message}</div>}
      {currentPage === 'home' && (
        <Home
          onNavigate={navigate}
          onAdicionar={handleAddToCart}
          cart={cart}
          user={user}
          onLogout={handleLogout}
          onLogin={() => navigate('auth', 'login')}
          onRemover={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}
      {currentPage === 'restaurantes' && (
        <Restaurantes
          onNavigate={navigate}
          onAdicionar={handleAddToCart}
          cart={cart}
          user={user}
          onLogout={handleLogout}
          onLogin={() => navigate('auth', 'login')}
          onRemover={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}
      {currentPage === 'restaurante' && selectedRestaurantId && (
        <Restaurante
          restaurantId={selectedRestaurantId}
          onNavigate={navigate}
          onAdicionar={handleAddToCart}
          cart={cart}
          user={user}
          onLogout={handleLogout}
          onLogin={() => navigate('auth', 'login')}
          onRemover={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      )}
      {currentPage === 'pedidos' && (
         <Pedidos
           onNavigate={navigate}
           user={user}
           onLogin={() => navigate('auth', 'login')}
           onLogout={handleLogout}
           cart={cart}
           onRemover={handleRemoveFromCart}
           onCheckout={handleCheckout}
      />
       )}
      {currentPage === 'auth' && (
        <Auth
          onNavigate={navigate}
          onLogin={handleLogin}
          onRegister={handleRegister}
          authView={authView}
          user={user}
        />
      )}
    </>
  )
}

