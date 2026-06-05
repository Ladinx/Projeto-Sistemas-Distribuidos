import { useState } from 'react'
import Home from './pages/Home'
import Restaurantes from './pages/Restaurantes'
import Pedidos from './pages/Pedidos'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'restaurantes' && <Restaurantes onNavigate={setCurrentPage} />}
      {currentPage === 'pedidos' && <Pedidos onNavigate={setCurrentPage} />}
    </>
  )
}

