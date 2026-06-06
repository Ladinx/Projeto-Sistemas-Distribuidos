const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  // verifica antes de tentar parsear o json
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  logout: () => removeToken(),

  // Restaurantes
  getRestaurantes: () => request('/restaurantes'),
  getRestaurante: (id) => request(`/restaurantes/${id}`),
  updateRestaurante: (id, body) => request(`/restaurantes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Produtos
  getProdutos: (restauranteId) => request(`/restaurantes/${restauranteId}/produtos`),
  createProduto: (restauranteId, body) => request(`/restaurantes/${restauranteId}/produtos`, { method: 'POST', body: JSON.stringify(body) }),
  updateProduto: (produtoId, body) => request(`/produtos/${produtoId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduto: (produtoId) => request(`/produtos/${produtoId}`, { method: 'DELETE' }),

  // Pedidos
  createPedido: (body) => request('/pedidos', { method: 'POST', body: JSON.stringify(body) }),
  getPedidos: () => request('/pedidos'),
  getPedido: (id) => request(`/pedidos/${id}`),
  updatePedidoStatus: (id, body) => request(`/pedidos/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  // Pagamentos
  createPagamento: (pedidoId, body) => request(`/pagamentos/${pedidoId}`, { method: 'POST', body: JSON.stringify(body) }),
  getPagamento: (pedidoId) => request(`/pagamentos/${pedidoId}`),

  // Token helpers
  setToken,
  getToken,
  removeToken,
  isLoggedIn: () => !!getToken(),
};

export default api;