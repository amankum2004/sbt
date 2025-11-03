import React from 'react'
import { vi } from 'vitest'

export const MockLoginContext = React.createContext()

export const MockLoginProvider = ({ children, value = {} }) => {
  const mockValue = {
    user: null,
    loggedIn: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkShopExists: vi.fn(),
    ...value
  }

  return (
    <MockLoginContext.Provider value={mockValue}>
      {children}
    </MockLoginContext.Provider>
  )
}

export const MockLoadingContext = React.createContext()

export const MockLoadingProvider = ({ children, value = {} }) => {
  const mockValue = {
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    ...value
  }

  return (
    <MockLoadingContext.Provider value={mockValue}>
      {children}
    </MockLoadingContext.Provider>
  )
}