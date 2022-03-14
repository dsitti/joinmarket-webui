import React from 'react'
import { render, screen } from '../testUtils'
import { act } from 'react-dom/test-utils'
import user from '@testing-library/user-event'

import App from './App'

describe('<App />', () => {
  const setup = () => {
    render(<App />)
  }

  it('should display Onboarding screen initially', () => {
    act(setup)

    // Onboarding screen
    expect(screen.getByText('Get started')).toBeInTheDocument()
    expect(screen.getByText('Skip intro')).toBeInTheDocument()

    // Wallets screen shown after Intro is skipped
    expect(screen.queryByText('wallets.title')).not.toBeInTheDocument()

    act(() => {
      const skipIntro = screen.getByText('Skip intro')
      user.click(skipIntro)
    })

    expect(screen.getByText('wallets.title')).toBeInTheDocument()
  })

  it('should display Wallets screen directly when Onboarding screen has been shown', () => {
    global.__DEV__.addToAppSettings({ showOnboarding: false })

    act(setup)

    // Wallets screen
    expect(screen.getByText('wallets.title')).toBeInTheDocument()
    expect(screen.getByText('wallets.button_new_wallet')).toBeInTheDocument()

    // footer
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
  })

  it('should display a modal with alpha warning information', () => {
    global.__DEV__.addToAppSettings({ showOnboarding: false })

    act(setup)

    expect(screen.getByText('Read this before using.')).toBeInTheDocument()
    expect(screen.queryByText(/While JoinMarket is tried and tested, Jam is not./)).not.toBeInTheDocument()

    act(() => {
      const readThis = screen.getByText('Read this before using.')
      user.click(readThis)
    })

    expect(screen.getByText(/While JoinMarket is tried and tested, Jam is not./)).toBeInTheDocument()
    expect(screen.getByText('Fine with me.')).toBeInTheDocument()
  })

  it('should display a websocket connection indicator', async () => {
    global.__DEV__.addToAppSettings({ showOnboarding: false })

    act(setup)

    expect(screen.getByText('•').classList.contains('text-danger')).toBe(true)
    expect(screen.getByText('•').classList.contains('text-success')).toBe(false)
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()

    await global.__DEV__.JM_WEBSOCKET_SERVER_MOCK.connected

    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('•').classList.contains('text-success')).toBe(true)
    expect(screen.getByText('•').classList.contains('text-danger')).toBe(false)
  })
})
