import { useEffect, useState } from 'react'
import api from '../api.js'

const STAGES = ['lead', 'em_negociacao', 'ativo', 'inativo']

const STAGE_LABELS = {
  lead: 'Lead',
  em_negociacao: 'Em negociacao',
  ativo: 'Ativo',
  inativo: 'Inativo'
}

const INTERACTION_TYPES = ['nota', 'ligacao', 'email', 'whatsapp', 'reuniao']

const INTERACTION_LABELS = {
  nota: 'Nota',
  ligacao: 'Ligacao',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  reuniao: 'Reuniao'
}

export default function Pipeline() {
  const [pipeline, setPipeline] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [newInteraction, setNewInteraction] = useState({ type: 'nota', note: '' })

  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' })

  async function loadPipeline() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/clients/pipeline')
      setPipeline(res.data)
    } catch (err) {
      setError('Erro ao carregar o funil de clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPipeline()
  }, [])

  async function handleCreateClient(e) {
    e.preventDefault()
    if (!newClient.name) return
    try {
      await api.post('/clients', { ...newClient, status: 'lead' })
      setNewClient({ name: '', phone: '', email: '' })
      loadPipeline()
    } catch (err) {
      setError('Erro ao cadastrar cliente.')
    }
  }

  async function handleStageChange(clientId, status) {
    try {
      await api.patch(`/clients/${clientId}/status`, { status })
      loadPipeline()
    } catch (err) {
      setError('Erro ao mover cliente no funil.')
    }
  }

  async function openClient(client) {
    setSelectedClient(client)
    try {
      const res = await api.get(`/clients/${client.id}/interactions`)
      setInteractions(res.data)
    } catch (err) {
      setError('Erro ao carregar historico do cliente.')
    }
  }

  function closeClient() {
    setSelectedClient(null)
    setInteractions([])
    setNewInteraction({ type: 'nota', note: '' })
  }

  async function handleAddInteraction(e) {
    e.preventDefault()
    if (!newInteraction.note || !selectedClient) return
    try {
      await api.post(`/clients/${selectedClient.id}/interactions`, newInteraction)
      setNewInteraction({ type: 'nota', note: '' })
      const res = await api.get(`/clients/${selectedClient.id}/interactions`)
      setInteractions(res.data)
    } catch (err) {
      setError('Erro ao registrar interacao.')
    }
  }

  return (
    <div className="pipeline">
      {error && <p className="error">{error}</p>}

      <section className="new-client">
        <h2>Novo lead</h2>
        <form onSubmit={handleCreateClient}>
          <input
            type="text"
            placeholder="Nome"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Telefone / WhatsApp"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          />
          <input
            type="email"
            placeholder="E-mail (opcional)"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <button type="submit">Adicionar ao funil</button>
        </form>
      </section>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <section className="board">
          {STAGES.map((stage) => (
            <div key={stage} className={`board-column board-${stage}`}>
              <h3>
                {STAGE_LABELS[stage]}
                <span className="board-count">{pipeline[stage]?.length || 0}</span>
              </h3>
              <div className="board-cards">
                {(pipeline[stage] || []).map((client) => (
                  <div key={client.id} className="board-card" onClick={() => openClient(client)}>
                    <strong>{client.name}</strong>
                    {client.phone && <span>{client.phone}</span>}
                    <select
                      value={client.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStageChange(client.id, e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedClient && (
        <div className="client-modal-backdrop" onClick={closeClient}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>{selectedClient.name}</h2>
              <button className="close-btn" onClick={closeClient}>
                &times;
              </button>
            </header>
            <p className="muted">
              {selectedClient.phone || 'Sem telefone'} · {selectedClient.email || 'Sem e-mail'}
            </p>

            <h3>Registrar interacao</h3>
            <form className="interaction-form" onSubmit={handleAddInteraction}>
              <select
                value={newInteraction.type}
                onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
              >
                {INTERACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INTERACTION_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="O que aconteceu?"
                value={newInteraction.note}
                onChange={(e) => setNewInteraction({ ...newInteraction, note: e.target.value })}
                required
              />
              <button type="submit">Registrar</button>
            </form>

            <h3>Historico</h3>
            {interactions.length === 0 ? (
              <p className="muted">Nenhuma interacao registrada ainda.</p>
            ) : (
              <ul className="interaction-list">
                {interactions.map((i) => (
                  <li key={i.id}>
                    <span className="interaction-type">{INTERACTION_LABELS[i.type]}</span>
                    <span className="interaction-note">{i.note}</span>
                    <span className="interaction-date">
                      {new Date(i.created_at).toLocaleString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
