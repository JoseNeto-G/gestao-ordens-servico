import { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  function handleLogout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
