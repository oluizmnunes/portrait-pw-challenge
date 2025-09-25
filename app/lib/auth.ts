import Cookies from 'js-cookie'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

const COOKIE_NAME = 'auth_token'
const SESSION_COOKIE = 'user_session'

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@test.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'user@test.com',
    password: 'User123!',
    name: 'Regular User',
    role: 'user' as const
  }
]

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const user = users.find(u => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const { password: _, ...userWithoutPassword } = user

  // Set auth cookie
  Cookies.set(COOKIE_NAME, user.id, { expires: 1 })
  Cookies.set(SESSION_COOKIE, JSON.stringify(userWithoutPassword), { expires: 1 })

  return { success: true, user: userWithoutPassword }
}

export const logout = () => {
  Cookies.remove(COOKIE_NAME)
  Cookies.remove(SESSION_COOKIE)
}

export const getCurrentUser = (): User | null => {
  const session = Cookies.get(SESSION_COOKIE)
  if (!session) return null

  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return !!Cookies.get(COOKIE_NAME)
}