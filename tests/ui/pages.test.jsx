import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { nav } from '../support/next.jsx'
import { mockFetch, sentBody } from '../support/fetch.js'
import { knownBug } from '../support/known-bug.js'
import ChatGuide from '@/app/chat-guide/page'
import SharedTrip from '@/app/shared-trip/[id]/page'
import AboutUs from '@/app/about-us/page'
import ContactUs from '@/app/contact-us/page'
import PrivacyPolicy from '@/app/privacy-policy/page'
import Terms from '@/app/terms-conditions/page'

describe('static pages', () => {
  test.each([
    ['About Us', AboutUs, 'About TripSage', ['Our Story', 'Our Values', 'Meet Our Team']],
    ['Contact Us', ContactUs, 'Contact Us', ['Get in Touch']],
    ['Privacy Policy', PrivacyPolicy, 'Privacy Policy', ['Information We Collect', 'Your Rights']],
    ['Terms', Terms, 'Terms & Conditions', ['Definitions', 'User Conduct']],
  ])('%s renders its sections and a link home', (_name, Page, title, sections) => {
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    for (const s of sections) expect(screen.getByRole('heading', { name: s })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Home/ })[0]).toHaveAttribute('href', '/')
  })

  // FINDING: the contact form has no submit handler: what a visitor writes is never sent.
  knownBug('the contact form sends the message', () => {
    const fetchMock = mockFetch({})
    render(<ContactUs />)
    const form = document.querySelector('form')
    form.querySelectorAll('input, textarea').forEach((el) => fireEvent.change(el, { target: { value: el.type === 'email' ? 'a@x.com' : 'Hello' } }))
    fireEvent.submit(form)
    expect(fetchMock).toHaveBeenCalled()
  })
})

describe('chat guide', () => {
  const ask = (text) => {
    fireEvent.change(screen.getByPlaceholderText('Ask me anything about travel...'), { target: { value: text } })
    fireEvent.submit(screen.getByPlaceholderText('Ask me anything about travel...').closest('form'))
  }

  test('sends the conversation and shows the reply as markdown', async () => {
    const fetchMock = mockFetch({ 'POST /api/chat': { text: 'Try **Hampi**' } })
    render(<ChatGuide />)
    expect(screen.getByRole('heading', { name: 'Welcome to TripSage AI' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask me anything about travel...')).toHaveFocus()
    ask('   ')
    expect(fetchMock).not.toHaveBeenCalled()
    ask('Where should I go?')
    expect(await screen.findByText('Hampi', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Where should I go?')).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/chat').messages.map((m) => m.role)).toEqual(['system', 'user'])
  })

  test('an error reply is apologised for', async () => {
    mockFetch({ 'POST /api/chat': { status: 500, body: { error: 'x' } } })
    render(<ChatGuide />)
    ask('Hello')
    expect(await screen.findByText('I apologize, but I encountered an error. Please try again.')).toBeInTheDocument()
  })

  test('the second question includes the first answer as an "assistant" message', async () => {
    const fetchMock = mockFetch({ 'POST /api/chat': { text: 'Goa' } })
    render(<ChatGuide />)
    ask('Beach?')
    await screen.findByText('Goa')
    ask('When?')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(sentBody(fetchMock, '/api/chat', 1).messages.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'user'])
  })
})

describe('shared trip page', () => {
  const summary = {
    destination: 'Kyoto',
    summary_text: 'A week of temples and tea. '.repeat(10),
    created_at: '2026-04-01T00:00:00Z',
    place_info: { description: 'Old capital', highlights: ['Gion'], best_time_to_visit: 'Spring', language: 'Japanese', currency: 'Yen' },
    budget_info: { accommodation: '$80', food: '$30', transportation: '$10', activities: '$20', total_estimate: '$1,000' },
    itinerary_info: { recommended_days: 5, days: [{ day: 1, title: 'Temples', description: 'East side', activities: ['Kiyomizu'] }] },
  }

  test('shows the shared summary with share buttons and a copy link', async () => {
    nav.params = { id: 'share-1' }
    const fetchMock = mockFetch({ '/api/trip-summary/share-1': { success: true, summary } })
    vi.stubGlobal('alert', vi.fn())
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn() }, configurable: true })
    render(<SharedTrip />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Kyoto' })).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/trip-summary/share-1')
    expect(screen.getByText('Recommended duration: 5 days')).toBeInTheDocument()
    expect(screen.getByText('Day 1: Temples')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle('Copy link to clipboard'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href)
    expect(alert).toHaveBeenCalledWith('Link copied to clipboard!')
  })

  test.each([
    [{ status: 404, body: { error: 'Trip summary not found' } }],
    [{ status: 500, body: 'not json' }],
    [{ body: { success: true } }],
  ])('a missing or failing summary shows a way home (%#)', async (route) => {
    nav.params = { id: 'gone' }
    mockFetch({ '/api/trip-summary/gone': route })
    render(<SharedTrip />)
    expect(await screen.findByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/')
  })
})
