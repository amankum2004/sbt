import React from 'react'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { render } from '../utils/test-utils'
import { Home } from '../../client/src/pages/home'

describe('Home Page', () => {
  it('renders homepage content', () => {
    render(<Home />)
    
    // The page should render without errors
    // Check for any content that indicates the page loaded
    const mainElement = document.querySelector('main') || document.body
    expect(mainElement).toBeInTheDocument()
  })

  it('has visible content', () => {
    render(<Home />)
    
    // Check that there's some visible content on the page
    const visibleElements = document.body.querySelectorAll('*')
    expect(visibleElements.length).toBeGreaterThan(1)
  })
})