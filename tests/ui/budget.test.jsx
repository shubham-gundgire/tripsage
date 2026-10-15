import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { knownBug } from '../support/known-bug.js'
import BudgetTracker from '@/app/budget-tracker/page'
import ExpenseList from '@/app/budget-tracker/components/ExpenseList'
import ExpenseForm from '@/app/budget-tracker/components/ExpenseForm'
import CurrencyConverter from '@/app/budget-tracker/components/CurrencyConverter'
import BudgetSummary from '@/app/budget-tracker/components/BudgetSummary'
import * as storage from '@/app/budget-tracker/utils/storageUtils'

const stored = () => JSON.parse(localStorage.getItem('tripSageTrips'))
const trip = (id, overrides = {}) => ({ id, name: `Trip ${id}`, totalBudget: 1000, baseCurrency: 'USD', expenses: [], ...overrides })

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  vi.stubGlobal('confirm', vi.fn(() => true))
})

describe('the budget tracker page', () => {
  test('a first visit creates "My First Trip" with default category budgets', async () => {
    render(<BudgetTracker />)
    expect(await screen.findByRole('heading', { name: 'My First Trip' })).toBeInTheDocument()
    const [saved] = stored()
    expect(saved).toMatchObject({ name: 'My First Trip', totalBudget: 1000, baseCurrency: 'USD' })
    expect(saved.categoryBudgets).toMatchObject({ accommodation: 300, transportation: 250, food: 200, activities: 150, shopping: 50, other: 50 })
    expect(localStorage.getItem('lastActiveTripId')).toBe(saved.id)
  })

  test('reopens the last active trip, or the first one', async () => {
    localStorage.setItem('tripSageTrips', JSON.stringify([trip('a'), trip('b', { categoryBudgets: { food: 5 } })]))
    localStorage.setItem('lastActiveTripId', 'b')
    const { unmount } = render(<BudgetTracker />)
    expect(await screen.findByRole('heading', { name: 'Trip b' })).toBeInTheDocument()
    unmount()
    localStorage.setItem('lastActiveTripId', 'gone')
    render(<BudgetTracker />)
    expect(await screen.findByRole('heading', { name: 'Trip a' })).toBeInTheDocument()
  })

  test('renames the trip, changes budget and currency, and saves each change', async () => {
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('heading', { name: 'My First Trip' }).nextSibling)
    const nameBox = screen.getByDisplayValue('My First Trip')
    fireEvent.change(nameBox, { target: { value: 'Goa 2026' } })
    fireEvent.keyDown(nameBox, { key: 'Enter' })
    expect(screen.getByRole('heading', { name: 'Goa 2026' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('heading', { name: 'Goa 2026' }).nextSibling)
    fireEvent.keyDown(screen.getByDisplayValue('Goa 2026'), { key: 'a' })
    fireEvent.blur(screen.getByDisplayValue('Goa 2026'))
    fireEvent.click(screen.getByRole('heading', { name: 'Goa 2026' }).nextSibling)
    fireEvent.click(screen.getByDisplayValue('Goa 2026').nextSibling)

    fireEvent.change(screen.getByLabelText('Total Budget:'), { target: { value: '2500' } })
    fireEvent.change(screen.getByLabelText('Currency:'), { target: { value: 'INR' } })
    expect(stored()[0]).toMatchObject({ name: 'Goa 2026', totalBudget: 2500, baseCurrency: 'INR' })
    expect(screen.getByText('₹0.00 / ₹2500.00')).toBeInTheDocument()
  })

  test('adds, edits and deletes expenses; the summary follows', async () => {
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('button', { name: /Add New Expense/ }))
    // The expense form and the currency converter both use id="amount", so the form's label
    // points at the converter's box; find the form's field by name instead.
    const amountField = () => document.querySelector('form input[name="amount"]')
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Hotel' } })
    fireEvent.change(amountField(), { target: { value: '400' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))
    expect(screen.getByText('$400.00 / $1000.00')).toBeInTheDocument()
    expect(screen.getByText('$600.00 remaining')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit Expense' })).toBeInTheDocument()
    fireEvent.change(amountField(), { target: { value: '1200' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Expense' }))
    expect(screen.getByText('$200.00 over budget')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Add New Expense/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('No expenses yet. Add your first expense to get started!')).toBeInTheDocument()
    expect(stored()[0].expenses).toEqual([])
  })

  test('creates, switches between and deletes trips', async () => {
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('button', { name: /Delete Trip/ }))
    expect(alert).toHaveBeenCalledWith("You can't delete your only trip. Create a new one first.")

    fireEvent.click(screen.getByRole('button', { name: /Select Trip/ }))
    fireEvent.click(screen.getByRole('button', { name: /Create New Trip/ }))
    expect(screen.getByRole('button', { name: 'Create Trip' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: /Select Trip/ }))
    fireEvent.click(screen.getByRole('button', { name: /Create New Trip/ }))
    fireEvent.change(screen.getByLabelText('Trip Name'), { target: { value: 'Kerala' } })
    vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 0, 1))
    fireEvent.click(screen.getByRole('button', { name: 'Create Trip' }))
    expect(await screen.findByRole('heading', { name: 'Kerala' })).toBeInTheDocument()
    vi.mocked(Date.now).mockRestore()

    fireEvent.click(screen.getByRole('button', { name: /Select Trip/ }))
    fireEvent.click(within(document.body).getByRole('button', { name: 'My First Trip' }))
    expect(await screen.findByRole('heading', { name: 'My First Trip' })).toBeInTheDocument()

    confirm.mockReturnValueOnce(false)
    fireEvent.click(screen.getByRole('button', { name: /Delete Trip/ }))
    expect(stored()).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: /Delete Trip/ }))
    expect(await screen.findByRole('heading', { name: 'Kerala' })).toBeInTheDocument()
    expect(stored().map((t) => t.name)).toEqual(['Kerala'])
  })

  test('the trip list closes when clicking elsewhere', async () => {
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('button', { name: /Select Trip/ }))
    fireEvent.mouseDown(screen.getByRole('button', { name: /Create New Trip/ }))
    expect(screen.getByRole('button', { name: /Create New Trip/ })).toBeInTheDocument()
    fireEvent.mouseDown(document.querySelector('main') ?? document.body.firstChild)
    expect(screen.queryByRole('button', { name: /Create New Trip/ })).not.toBeInTheDocument()
  })

  test('export shows and downloads the trip; import loads trips back', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('button', { name: /Export/ }))
    const box = [...document.querySelectorAll('textarea')].find((t) => t.readOnly)
    expect(JSON.parse(box.value).name).toBe('My First Trip')
    fireEvent.click(box)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /Download JSON/ }))
    expect(click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    fireEvent.click(screen.getByRole('button', { name: /Import Data/ }))
    expect(screen.getByText('Please enter valid JSON data')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Paste JSON data here...'), { target: { value: 'not json' } })
    fireEvent.click(screen.getByRole('button', { name: /Import Data/ }))
    expect(screen.getByText('Failed to import data. Please check the format and try again.')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Paste JSON data here...'), { target: { value: JSON.stringify(trip('imported', { name: 'Imported Trip' })) } })
    fireEvent.click(screen.getByRole('button', { name: /Import Data/ }))
    expect(stored().map((t) => t.name)).toContain('Imported Trip')
    expect(screen.queryByText('Import Trip Data')).not.toBeInTheDocument()
  })

  test('import from a file, and the close buttons', async () => {
    render(<BudgetTracker />)
    await screen.findByRole('heading', { name: 'My First Trip' })
    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File([JSON.stringify(trip('f1'))], 'trip.json', { type: 'application/json' })] } })
    await waitFor(() => expect(screen.getByPlaceholderText('Paste JSON data here...').value).toContain('"f1"'))
    fireEvent.change(input, { target: { files: [] } })
    const failing = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () {
      this.onerror()
    })
    fireEvent.change(input, { target: { files: [new File(['x'], 'x.json')] } })
    expect(screen.getByText('Error reading file')).toBeInTheDocument()
    failing.mockRestore()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    fireEvent.click(screen.getByRole('heading', { name: 'Import Trip Data' }).nextSibling)
    fireEvent.click(screen.getByRole('button', { name: /Export/ }))
    fireEvent.click(screen.getByRole('heading', { name: 'Export Trip Data' }).nextSibling)
    expect(screen.queryByText('Export Trip Data')).not.toBeInTheDocument()
  })
})

describe('budget components', () => {
  const expenses = [
    { id: '1', description: 'Taxi', amount: 30, category: 'transportation', date: Date.UTC(2026, 0, 3), location: 'Airport' },
    { id: '2', description: 'Dinner', amount: 80, category: 'food', date: Date.UTC(2026, 0, 1) },
    { id: '3', description: 'Mystery', amount: 5, category: 'nope', date: Date.UTC(2026, 0, 2) },
  ]

  test('ExpenseList sorts by each column, both ways, and filters', () => {
    render(<ExpenseList expenses={expenses} onEdit={vi.fn()} onDelete={vi.fn()} baseCurrency="XXX" />)
    const order = () => screen.getAllByRole('row').slice(1).map((r) => r.cells[1].textContent.replace('Airport', ''))
    expect(order()).toEqual(['Taxi', 'Mystery', 'Dinner'])
    fireEvent.click(screen.getByText('Date'))
    expect(order()).toEqual(['Dinner', 'Mystery', 'Taxi'])
    fireEvent.click(screen.getByText('Amount'))
    expect(order()).toEqual(['Mystery', 'Taxi', 'Dinner'])
    fireEvent.click(screen.getByText('Description'))
    expect(order()).toEqual(['Dinner', 'Mystery', 'Taxi'])
    fireEvent.click(screen.getByText('Category'))
    expect(order()).toEqual(['Dinner', 'Taxi', 'Mystery'])
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('$30.00')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'food' } })
    expect(order()).toEqual(['Dinner'])
  })

  test('ExpenseForm validates and converts the date', () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} baseCurrency="EUR" />)
    expect(screen.getByText('€')).toBeInTheDocument()
    fireEvent.submit(screen.getByRole('button', { name: 'Add Expense' }).closest('form'))
    expect(alert).toHaveBeenCalledWith('Please enter a description')
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Museum' } })
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: 'abc' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Add Expense' }).closest('form'))
    expect(alert).toHaveBeenCalledWith('Please enter a valid amount')
    fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '12.5' } })
    fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2026-03-04' } })
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'activities' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: 'Museum', amount: 12.5, category: 'activities', date: Date.UTC(2026, 2, 4) }))
  })

  test('ExpenseForm fills from an expense being edited', () => {
    render(<ExpenseForm onSubmit={vi.fn()} onCancel={vi.fn()} expense={{ description: 'Taxi', amount: 30, date: Date.UTC(2026, 0, 3) }} baseCurrency="USD" />)
    expect(screen.getByLabelText(/Description/)).toHaveValue('Taxi')
    expect(screen.getByLabelText(/Date/)).toHaveValue('2026-01-03')
    expect(screen.getByLabelText(/Category/)).toHaveValue('accommodation')
  })

  test('CurrencyConverter converts through USD and swaps', () => {
    const { rerender } = render(<CurrencyConverter baseCurrency="USD" />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })
    expect(screen.getByText(/€93\.00/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'INR' } })
    expect(screen.getByText(/₹8334\.00/)).toBeInTheDocument()
    expect(screen.getByText('1 USD = 83.3400 INR')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Swap currencies/ }))
    expect(screen.getByLabelText('From')).toHaveValue('INR')
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'GBP' } })
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '' } })
    expect(screen.queryByText(/Exchange rates are for informational/)).not.toBeInTheDocument()
    rerender(<CurrencyConverter baseCurrency="EUR" />)
    expect(screen.getByLabelText('To')).toHaveValue('USD')
  })

  test('BudgetSummary edits a category budget; progress colours follow spending', () => {
    const onChange = vi.fn()
    const { container } = render(
      <BudgetSummary expenses={[{ amount: 80, category: 'food' }, { amount: 260, category: 'transportation' }, { amount: 10, category: 'shopping' }]} totalBudget={1000} categoryBudgets={{ food: 100, transportation: 250, shopping: 50 }} onCategoryBudgetChange={onChange} baseCurrency="ZZZ" />
    )
    expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument()
    expect(screen.getByText('$80.00 / $100.00')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button')[2])
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '150' } })
    expect(onChange).toHaveBeenCalledWith('food', 150)
    fireEvent.click(screen.getAllByRole('button')[2])
  })
})

describe('storageUtils', () => {
  test('save, get, export and delete trips', () => {
    storage.saveTrip({ name: 'A', id: 'a' })
    storage.saveTrip({ name: 'B' })
    storage.saveTrip({ id: 'a', name: 'A2' })
    expect(storage.getTripById('a')).toMatchObject({ name: 'A2', created: expect.any(String), lastUpdated: expect.any(String) })
    expect(storage.getTripById('missing')).toBeNull()
    expect(JSON.parse(storage.exportTripData('a')).name).toBe('A2')
    expect(storage.exportTripData('missing')).toBeNull()
    expect(JSON.parse(storage.exportTripData())).toHaveLength(2)

    storage.setLastActiveTripId('a')
    expect(storage.deleteTrip('a')).toBe(true)
    expect(storage.getLastActiveTripId()).not.toBe('a')
    expect(storage.deleteTrip('nope')).toBe(false)
  })

  test('import accepts one trip or a list; anything else fails', () => {
    expect(storage.importTripData(JSON.stringify({ id: 'x', name: 'X' }))).toBe(true)
    expect(storage.importTripData(JSON.stringify([{ id: 'y' }]))).toBe(true)
    expect(storage.importTripData('42')).toBe(false)
    expect(storage.importTripData('{oops')).toBe(false)
  })

  test('storage failures are caught and logged', () => {
    localStorage.setItem('tripSageTrips', '{oops')
    expect(storage.loadTrips()).toEqual([])
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    storage.saveTrips([{ id: 'a' }])
    setItem.mockRestore()
    vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error('cycle')
    })
    expect(storage.exportTripData()).toBeNull()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(storage.deleteTrip('a')).toBe(false)
  })

  // FINDING: importing a list of trips replaces every saved trip, so importing a backup of
  // some trips silently deletes all the others.
  knownBug('importing a list adds to the saved trips', () => {
    storage.saveTrip({ id: 'mine', name: 'Mine' })
    storage.importTripData(JSON.stringify([{ id: 'other', name: 'Other' }]))
    expect(storage.getTripById('mine')).not.toBeNull()
  })

  // FINDING: deleting the last trip leaves lastActiveTripId pointing at it.
  knownBug('deleting the last trip forgets it as the active trip', () => {
    storage.saveTrip({ id: 'only' })
    storage.setLastActiveTripId('only')
    storage.deleteTrip('only')
    expect(storage.getLastActiveTripId()).toBeNull()
  })
})

// FINDING: an expense date is stored as UTC midnight and shown in local time, so west of UTC
// (e.g. New York) every expense is listed a day early.
knownBug('in New York an expense dated 4 March is listed on 4 March', () => {
  vi.stubEnv('TZ', 'America/New_York')
  render(<ExpenseList expenses={[{ id: '1', description: 'Museum', amount: 1, category: 'activities', date: new Date('2026-03-04').getTime() }]} onEdit={vi.fn()} onDelete={vi.fn()} baseCurrency="USD" />)
  expect(screen.getByText(new Date(2026, 2, 4).toLocaleDateString())).toBeInTheDocument()
})
