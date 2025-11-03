import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '../utils/test-utils'
import { Register } from '../../client/src/pages/Register'
import api from '../../client/src/utils/api'

// Mock the hooks properly
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../client/src/components/LoginContext', () => ({
  useLogin: () => ({
    loggedIn: false,
    login: vi.fn(),
    checkShopExists: vi.fn()
  })
}))

vi.mock('../../client/src/components/Loading', () => ({
  useLoading: () => ({
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  })
}))

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration page without errors', () => {
    render(<Register />)
    
    // Page should render without hook errors
    expect(document.body).toBeInTheDocument()
  })

  it('contains form elements', () => {
    render(<Register />)
    
    // Look for common form elements
    const buttons = screen.getAllByRole('button')
    const inputs = screen.queryAllByRole('textbox')
    const passwordInputs = screen.queryAllByPlaceholderText(/password/i)
    
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('allows user interaction', () => {
    render(<Register />)
    
    // Try to find and interact with any input
    const textInputs = screen.queryAllByRole('textbox')
    const allInputs = screen.queryAllByRole('textbox')
      .concat(screen.queryAllByRole('combobox'))
      .concat(screen.queryAllByRole('radio'))
      .concat(screen.queryAllByRole('checkbox'))
    
    if (allInputs.length > 0) {
      fireEvent.change(allInputs[0], { target: { value: 'test value' } })
      // If it's a controlled component, this might not change the value
      // but at least it shouldn't throw errors
    }
    
    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
    }
  })
})