import { useEffect, useState } from 'react'
import api from '../api.js'

const STATUSES = ['aberta', 'em_andamento', 'concluida', 'cancelada']

const STATUS_LABELS = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluida: 'Concluida',
  cancelada: 'Cancelada'
}

export default function Dashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    client_id: '',
    priority: 'normal'
  })

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/clients')
      ])
      setOrders(ordersRes.data)
      setClients(clientsRes.data)
    } catch (err) {
      setError('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const counts = STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length
    return acc
  }, {})

  async function handleCreateOrder(e) {
    e.preventDefault()
    if (!newOrder.title || !newOrder.client_id) return
    try {
      await api.post('/orders', newOrder)
      setNewOrder({ title: '', description: '', client_id: '', priority: 'normal' })
      loadData()
    } catch (err) {
      setError('Erro ao criar ordem de servico.')
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      loadData()
    } catch (err) {
      setError('Erro ao atualizar status.')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Gestao de Ordens de Servico</h1>
        <div className="user-info">
          <span>Ola, {user?.name}</span>
          <button onClick={onLogout}>Sair</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="cards">
        {STATUSES.map((status) => (
          <div key={status} className={`card card-${status}`}>
            <span className="card-count">{counts[status] || 0}</span>
            <span className="card-label">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </section>

      <section className="new-order">
        <h2>Nova ordem de servico</h2>
        <form onSubmit={handleCreateOrder}>
          <input
            type="text"
            placeholder="Titulo"
            value={newOrder.title}
            onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
            required
          />
          <select
            value={newOrder.client_id}
            onChange={(e) => setNewOrder({ ...newOrder, client_id: e.target.value })}
            required
          >
            <option value="">Selecione o cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={newOrder.priority}
            onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
          >
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
          </select>
          <input
            type="text"
            placeholder="Descricao (opcional)"
            value={newOrder.description}
            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
          />
          <button type="submit">Criar</button>
        </form>
      </section>

      <section className="orders-table">
        <h2>Ordens de servico</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Cliente</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.title}</td>
                  <td>{order.client_name}</td>
                  <td>{order.priority}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
