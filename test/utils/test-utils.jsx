import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock common dependencies
vi.mock('../../client/src/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve())
  }
}))

// Mock contexts
const MockLoginProvider = ({ children }) => {
  return (
    <div data-testid="login-provider">
      {children}
    </div>
  )
}

const MockLoadingProvider = ({ children }) => {
  return (
    <div data-testid="loading-provider">
      {children}
    </div>
  )
}

// Re-export testing library methods
export * from '@testing-library/react'

// Custom render with ALL providers
const customRender = (ui, options = {}) => {
  const AllProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <MockLoginProvider>
          <MockLoadingProvider>
            {children}
          </MockLoadingProvider>
        </MockLoginProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: AllProviders, ...options })
}

export { customRender as render, MockLoginProvider, MockLoadingProvider }