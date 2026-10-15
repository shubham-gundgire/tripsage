import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { router, nav } from '../support/next.jsx'
import { mockFetch, sentBody } from '../support/fetch.js'
import { knownBug } from '../support/known-bug.js'
import DestinationDetails from '@/app/destination-details/page'
import DestinationLayout, { metadata } from '@/app/destination-details/layout'
import Loading from '@/app/destination-details/loading'
import DestinationError from '@/app/destination-details/error'

// One answer per section, shaped like the API's (and the model's) JSON.
const data = {
  overview: {
    description: 'Old capital of Japan',
    attractions: ['Fushimi Inari', 'Kinkaku-ji'],
    cultural: 'Tea ceremonies',
    weather: 'Mild spring',
    safety: 'Very safe',
    bestTime: 'Spring',
    language: 'Japanese',
    currency: 'Yen',
    timezone: 'JST',
    relatedDestinations: [{ name: 'Nara', description: 'Deer park' }],
  },
  accommodation: {
    options: [
      { type: 'Budget Stays', priceRange: '$30 - $70 per night', description: 'Hostels', recommendations: ['Piece Hostel'] },
      { type: 'Mid-range Hotels', priceRange: '$100 - $200 per night', description: 'Comfort', recommendations: ['Hotel A'] },
      { type: 'Luxury Ryokan', priceRange: '$400+', description: 'Onsen', recommendations: ['Ryokan B'] },
    ],
  },
  food: { cuisine: 'Kaiseki', dishes: ['Yudofu: tofu hot pot', 'Matcha'], restaurants: [{ name: 'Okutan', type: 'Tofu', description: 'Since 1635' }], dietary: 'Veg options exist' },
  transportation: {
    gettingThere: 'Fly into **Kansai**\n\nThen take the train\n* Haruka express',
    nearestAirport: 'KIX',
    distance: { Osaka: '45 km' },
    localTransport: 'Buses and subway',
    transportOptions: ['Bus', 'Taxi', 'Auto rickshaw', 'Car hire', 'Train', 'Ferry', 'Bicycle'],
    tips: ['Get an ICOCA card'],
  },
  events: {
    events: [{ name: 'Gion Matsuri', date: 'July', description: 'Floats' }],
    activities: [
      { name: 'Temple walk', type: 'Cultural', description: 'Zen gardens' },
      { name: 'Hike', type: 'Adventure', description: 'Mount Kurama' },
      { name: 'Spa', type: 'Wellness', description: 'Onsen' },
    ],
    tours: ['Night food tour'],
  },
  budget: {
    summary: 'Moderate',
    totalCost: { budget: 800, midrange: 1500, luxury: 3000 },
    breakdown: [
      { category: 'Accommodation', cost: { budget: 300, midrange: 700, luxury: 'Variable' } },
      { category: 'Food', cost: 200 },
      { category: 'Shopping', cost: 'Up to you' },
    ],
    disclaimer: 'Approximate',
  },
  itinerary: { intro: 'Five days', days: [{ title: 'Day 1: Temples', activities: [{ time: 'Morning', title: 'Kiyomizu', description: 'Early start' }, { time: 'Evening', title: 'Gion', description: 'Walk' }] }] },
  tips: { bestTime: 'Spring', currentSeason: 'Cherry blossom', customs: 'Bow', etiquetteTips: ['No tipping'], language: { overview: 'Japanese', phrases: ['Arigato'] }, emergency: { info: 'Dial 110', contacts: ['Police: 110'] } },
  shopping: { overview: 'Crafts', shoppingAreas: [{ name: 'Nishiki Market', type: 'Market', description: 'Food' }], souvenirs: ['Fans'] },
}

const answer = (overrides = {}) => (url, init) => {
  const { section } = JSON.parse(init.body)
  return { ...data, ...overrides }[section] ?? { status: 500, body: {} }
}

async function open(query = 'destination=Kyoto&startDate=2026-04-01&endDate=2026-04-05&guests=2', route = answer()) {
  nav.search = new URLSearchParams(query)
  const fetchMock = mockFetch({ 'POST /api/destination-details': route, 'POST /api/trip-summary': { success: true, shareUrl: '/shared-trip/abc' } })
  render(<DestinationDetails />)
  if (query.includes('destination=')) await screen.findByRole('heading', { name: 'Explore Kyoto' })
  return fetchMock
}
const section = (title) => fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }))

describe('the destination page', () => {
  test('without a destination it shows the search', () => {
    render(<DestinationDetails />)
    expect(screen.getByRole('heading', { name: 'Find Your Perfect Destination' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Where do you want to go?')).toBeInTheDocument()
  })

  test('loads the overview for the trip and shows the key facts', async () => {
    const fetchMock = await open()
    expect(sentBody(fetchMock, '/api/destination-details')).toEqual({ destination: 'Kyoto', startDate: '2026-04-01', endDate: '2026-04-05', guests: 2, section: 'overview' })
    expect(screen.getByRole('heading', { level: 1, name: 'Kyoto' })).toBeInTheDocument()
    expect(screen.getByText('4 days')).toBeInTheDocument()
    expect(screen.getAllByText('2 Guests').length).toBeGreaterThan(0)
    for (const v of ['Spring', 'Japanese', 'Yen', 'JST', 'Fushimi Inari', 'Tea ceremonies', 'Very safe']) expect(screen.getAllByText(v).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('heading', { name: 'Nara' }))
    expect(router.push).toHaveBeenCalledWith('/destination-details?destination=Nara')
    fireEvent.click(screen.getAllByRole('button').at(-1))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  test('every section loads on demand and renders its content', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await open()
    section('Accommodation Options')
    expect(await screen.findByText('₹2,490 - ₹5,810 per night')).toBeInTheDocument()
    expect(screen.getByText('Price on request')).toBeInTheDocument()
    await act(async () => vi.advanceTimersByTime(100))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()

    section('Food and Dining')
    expect(await screen.findByText('tofu hot pot')).toBeInTheDocument()
    expect(screen.getByText('A local delicacy worth trying.')).toBeInTheDocument()

    section('Travel & Transportation')
    expect(await screen.findByText('Kansai', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('45 km')).toBeInTheDocument()
    expect(screen.getByText('Get an ICOCA card')).toBeInTheDocument()

    section('Events & Activities')
    expect(await screen.findByText('Gion Matsuri')).toBeInTheDocument()
    expect(screen.getByText('Mount Kurama')).toBeInTheDocument()

    section('Budget Estimate')
    expect(await screen.findByText('₹66,400')).toBeInTheDocument()
    expect(screen.getByText('$1,500 USD')).toBeInTheDocument()
    expect(screen.getByText('Variable')).toBeInTheDocument()
    expect(screen.getByText('₹16,600')).toBeInTheDocument()
    expect(screen.getByText('Up to you')).toBeInTheDocument()
    for (const b of screen.getAllByRole('button', { name: /^(budget|midrange|luxury)$/ })) fireEvent.click(b)

    section('Suggested Itinerary')
    expect(await screen.findByText('Kiyomizu')).toBeInTheDocument()
    section('Travel Tips')
    expect(await screen.findByText('Cherry blossom')).toBeInTheDocument()
    expect(screen.getByText('Police: 110')).toBeInTheDocument()
    section('Shopping & Souvenirs')
    expect(await screen.findByText('Nishiki Market')).toBeInTheDocument()

    // Sections already loaded are not fetched again.
    const calls = fetch.mock.calls.length
    section('Destination Overview')
    expect(fetch.mock.calls.length).toBe(calls)
    vi.useRealTimers()
  })

  test('budget without tiers, tips without optional parts, no events', async () => {
    await open(undefined, answer({
      budget: { summary: 's', totalCost: 1200, breakdown: [{ category: 'All', cost: 1200 }], disclaimer: 'd' },
      tips: { bestTime: 'Any', customs: 'c', etiquetteTips: [] },
      events: { events: [], activities: [], tours: [] },
    }))
    section('Budget Estimate')
    expect((await screen.findAllByText('₹99,600')).length).toBe(2) // total and breakdown
    expect(screen.getByText('$1,200 USD')).toBeInTheDocument()
    section('Travel Tips')
    expect(await screen.findByText('Any')).toBeInTheDocument()
    section('Events & Activities')
    expect(await screen.findByText(/No specific events found/)).toBeInTheDocument()
    await open('destination=Kyoto', answer({ budget: { summary: 's', totalCost: 'Varies', breakdown: [], disclaimer: 'd' } }))
  })

  test('a section that fails twice shows the error with a retry', async () => {
    let failures = 0
    await open(undefined, (url, init) => {
      const { section: s } = JSON.parse(init.body)
      if (s === 'food' && failures++ < 2) return { status: 500, body: {} }
      return data[s]
    })
    section('Food and Dining')
    expect(await screen.findByText('Failed to load food information')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(await screen.findByRole('heading', { name: 'Explore Kyoto' })).toBeInTheDocument()
  })

  test('a failing first attempt is retried, and the page still loads', async () => {
    let failed = 0
    await open(undefined, (url, init) => {
      if (!failed++) return new Error('flaky')
      return answer()(url, init)
    })
    expect(screen.getAllByText('Fushimi Inari').length).toBeGreaterThan(0)
  })

  // FINDING: two effects both load the overview when the page opens (the destination effect
  // and the active-section effect), so every visit asks the AI for the overview twice.
  knownBug('the overview is requested once per visit', async () => {
    const fetchMock = await open()
    expect(fetchMock.mock.calls.filter(([, init]) => JSON.parse(init.body).section === 'overview')).toHaveLength(1)
  })

  test('if the overview fails twice the page shows the error', async () => {
    nav.search = new URLSearchParams('destination=Kyoto')
    mockFetch({ 'POST /api/destination-details': { status: 503, body: {} } })
    render(<DestinationDetails />)
    // Both loaders fail; whichever finishes last sets the message.
    expect(await screen.findByText(/^Failed to load (destination information: Failed after retry: API returned 503|overview information)$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  })

  test('sections show a loading state; the "Load Data" button fetches a missing section', async () => {
    let release
    await open('destination=Kyoto', (url, init) => {
      const { section: s } = JSON.parse(init.body)
      if (s === 'shopping') return new Promise((r) => (release = () => r(data.shopping)))
      return data[s]
    })
    section('Shopping & Souvenirs')
    expect(await screen.findByText('Loading Shopping & Souvenirs...')).toBeInTheDocument()
    await act(async () => release())
    expect(await screen.findByText('Nishiki Market')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument() // no dates: no duration
  })

  test('creates a shareable summary and copies its link', async () => {
    const fetchMock = await open()
    vi.stubGlobal('alert', vi.fn())
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => {}) }, configurable: true })
    fireEvent.click(screen.getByRole('button', { name: /Share Trip/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Generate Trip Summary' }))
    expect(await screen.findByRole('heading', { name: 'Trip Summary Created!' })).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/trip-summary')).toEqual({ destination: 'Kyoto', startDate: '2026-04-01', endDate: '2026-04-05', guests: 2 })
    expect(screen.getByDisplayValue('http://localhost:3000/shared-trip/abc'.replace(':3000', window.location.port ? `:${window.location.port}` : ''))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Copy Link/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Share link copied to clipboard!'))
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'))
    fireEvent.click(screen.getByRole('button', { name: /Copy Link/ }))
    expect(screen.getByRole('link', { name: /View Shared Trip Page/ })).toHaveAttribute('target', '_blank')
  })

  test('a failed summary can be retried', async () => {
    await open()
    mockFetch({ 'POST /api/trip-summary': { status: 503, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: /Share Trip/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Generate Trip Summary' }))
    expect(await screen.findByText('Failed to generate shareable trip summary. Please try again.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(await screen.findByText('Failed to generate shareable trip summary. Please try again.')).toBeInTheDocument()
  })

  test('one guest and a one-day trip use the singular', async () => {
    await open('destination=Kyoto&startDate=2026-04-01&endDate=2026-04-02&guests=1')
    expect(screen.getAllByText('1 Guest').length).toBeGreaterThan(0)
    expect(screen.getByText('1 day')).toBeInTheDocument()
  })

  // FINDING: the transport texts from the AI are inserted with dangerouslySetInnerHTML. The
  // prompt includes the destination from the URL, so a crafted link can steer the model into
  // returning HTML with script handlers (cross-site scripting through prompt injection).
  knownBug('text from the AI is never inserted as HTML', async () => {
    await open(undefined, answer({ transportation: { ...data.transportation, gettingThere: '<img src=x onerror="alert(1)">' } }))
    section('Travel & Transportation')
    await screen.findByText('KIX')
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  // FINDING: the activity tips say "remember Mumbai can be hot and humid" for every destination.
  knownBug('activity tips do not talk about Mumbai for other cities', async () => {
    await open()
    section('Events & Activities')
    await screen.findByText('Gion Matsuri')
    expect(screen.queryByText(/Mumbai/)).not.toBeInTheDocument()
  })

  // FINDING: price ranges are read with /\d+/, so thousands separators split the numbers:
  // "$1,000 - $2,000" becomes "₹83 - ₹0 per night".
  knownBug('a range with thousands separators converts correctly', async () => {
    await open(undefined, answer({ accommodation: { options: [{ type: 'Luxury', priceRange: '$1,000 - $2,000 per night', description: 'd', recommendations: [] }] } }))
    section('Accommodation Options')
    expect(await screen.findByText('₹83,000 - ₹1,66,000 per night')).toBeInTheDocument()
  })

  // FINDING: the model is asked for costs as strings ("Total estimated cost in USD"), and the
  // fallback sends strings too, but only numbers are converted: the page shows "₹800" next to
  // "$800 USD" for the same amount.
  knownBug('budget tiers given as text are converted to rupees', async () => {
    await open(undefined, answer({ budget: { summary: 's', totalCost: { budget: '800', midrange: '1500', luxury: '3000' }, breakdown: [], disclaimer: 'd' } }))
    section('Budget Estimate')
    expect(await screen.findByText('₹66,400')).toBeInTheDocument()
  })

  // FINDING: the prompt describes `distance` as one string, but the page iterates it as an
  // object, so a model that follows the prompt gets one row per character.
  knownBug('a distance given as text is shown as text', async () => {
    await open(undefined, answer({ transportation: { ...data.transportation, distance: '45 km from Osaka' } }))
    section('Travel & Transportation')
    expect(await screen.findByText('45 km from Osaka')).toBeInTheDocument()
  })
})

describe('destination page wrappers', () => {
  test('layout, loading and error screens', () => {
    expect(metadata.title).toBe('Destination Details | TripSage')
    render(<DestinationLayout><p>child</p></DestinationLayout>)
    expect(screen.getByText('child')).toBeInTheDocument()
    render(<Loading />)
    expect(screen.getByRole('heading', { name: 'Loading destination information...' })).toBeInTheDocument()
    const reset = vi.fn()
    render(<DestinationError error={new Error('boom')} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('Destination details error:', expect.any(Error))
  })
})
