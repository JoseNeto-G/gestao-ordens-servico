import { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Pipeline from './pages/Pipeline.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('orders')

function handleLogout() {
  localStorage.removeItem('token')
  setUser(null)
}

if (!user) {
  return <Login onLogin={setUser} />
}

return (
  <div className="app-shell">
  <header className="app-header">
  <h1>Gestao de Ordens de Servico</h1>
  <nav className="app-nav">
  <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>
  Ordens de servico
  </button>
  <button className={view === 'crm' ? 'active' : ''} onClick={() => setView('crm')}>
  CRM / Funil de clientes
  </button>
  </nav>
  <div className="user-info">
  <span>Ola, {user?.name}</span>
  <button onClick={handleLogout}>Sair</button>
  </div>
  </header>
  
    {view === 'orders' ? <Dashboard user={user} /> : <Pipeline />}
  </div>
  )
}
