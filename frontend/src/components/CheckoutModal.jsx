import { useState } from 'react'
import './CheckoutModal.css'

export default function CheckoutModal({ onConfirm, onClose }) {
  const [endereco, setEndereco] = useState('')
  const [pagamento, setPagamento] = useState('pix')
  const [troco, setTroco] = useState('')
  const [error, setError] = useState(null)

  const handleConfirm = () => {
    if (!endereco.trim()) {
      setError('Informe o endereço de entrega.')
      return
    }
    if (pagamento === 'dinheiro' && !troco) {
      setError('Informe o valor para o troco.')
      return
    }
    onConfirm({ endereco, pagamento, troco })
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Finalizar Pedido</h2>

        <label>Endereço de entrega</label>
        <input
          type="text"
          placeholder="Rua, número, bairro..."
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />

        <label>Forma de pagamento</label>
        <div className="checkout-modal__payment">
          {[
            { value: 'pix', label: '⚡ Pix' },
            { value: 'cartao_credito', label: '💳 Crédito' },
            { value: 'cartao_debito', label: '💳 Débito' },
            { value: 'dinheiro', label: '💵 Dinheiro' },
          ].map((op) => (
            <button
              key={op.value}
              className={`checkout-modal__payment-btn ${pagamento === op.value ? 'active' : ''}`}
              onClick={() => setPagamento(op.value)}
            >
              {op.label}
            </button>
          ))}
        </div>

        {pagamento === 'dinheiro' && (
          <>
            <label>Troco para quanto?</label>
            <input
              type="number"
              placeholder="Ex: 50.00"
              min="0"
              step="0.01"
              value={troco}
              onChange={(e) => setTroco(e.target.value)}
            />
          </>
        )}

        {error && <p className="checkout-modal__error">{error}</p>}

        <div className="checkout-modal__actions">
          <button className="checkout-modal__cancel" onClick={onClose}>Cancelar</button>
          <button className="checkout-modal__confirm" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}