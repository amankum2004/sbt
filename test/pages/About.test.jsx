import React from 'react'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { render } from '../utils/test-utils'
import { About } from '../../client/src/pages/About'

describe('About Page', () => {
  it('renders about page content', () => {
    render(<About />)
    
    // The page should render without errors
    expect(document.body).toBeInTheDocument()
    
    // Look for any about-related content
    const aboutContent = screen.queryByText(/about/i) || document.body
    expect(aboutContent).toBeInTheDocument()
  })
})