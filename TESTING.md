# Testing

`tests/` is a standalone Vitest suite with its own `tests/package.json`. It changes no app code,
`package.json` or lockfile.

| Part | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| Server: `app/api`, `app/lib`, `lib`, `supabase-service-client.js` | 97.9% | 94.7% | 94.0% | 98.2% |
| UI: pages, components, context, budget tracker | 96.3% | 91.5% | 95.9% | 96.8% |
| All | 96.9% | 92.4% | 95.6% | 97.3% |

337 tests, 34 of them known bugs.

```bash
npm ci --legacy-peer-deps   # the app (react-datepicker 4 does not list React 19 as a peer)
cd tests && npm ci          # the test tooling (tests/.npmrc sets legacy-peer-deps, so React is not installed twice)
npm test | npm run coverage | npm run bugs   # bugs: run the known-bug tests as normal tests
```

Two Vitest projects:
- **server** (Node): every API route and library, against an in-memory stand-in for the Supabase client (`tests/support/fake-supabase.js`). It supports the query API the app uses: selects with joins and counts, filters, ordering, paging, single rows, insert, update, delete and injected errors.
- **ui** (jsdom, React Testing Library): every page and component, with stand-ins for Next's router, links, images and fonts, and for framer-motion.

No test reaches the network: `fetch` throws unless a test stubs it. Gemini, nodemailer, Cloudinary and Supabase are all replaced.

The generic `default:` renderer in `DestinationDetailsContent.jsx` cannot run (every section id has its own case) and accounts for most of the UI's uncovered lines.

## Security findings (outside the tests)

These were found reading the code and configuration. No secret value is reproduced here.

| Severity | Where | Finding |
|---|---|---|
| Critical | `app/lib/email.js`, `app/lib/emailService.js` | A Gmail address and its app password are hard-coded as the SMTP fallback. The repository is public. Revoke the app password and use environment variables only. |
| Critical | `lib/cloudinary.js` | The Cloudinary cloud name, API key and API secret are hard-coded. Rotate the secret. Combined with the unauthenticated `/api/upload`, anyone can upload to the account. |
| Critical | `db-recreate-tables.sql`, `app/api/auth/*` | Row-level security is left disabled ("Uncomment this section after initial data loading"). The app reads `users` (password hashes) and `password_reset_tokens` with the public anon key, so anyone with that key, which ships to every browser, can read them. Reading a reset token is enough to take over any account. The provided policies use `auth.uid()`, which never matches this app's own JWT login, so enabling them would break login: the auth routes need the service-role key server-side. |
| High | every route with a fallback | When `JWT_SECRET` is unset, tokens are signed and checked with the published string `your-jwt-secret-key`, so anyone can forge a login (tested below). |
| High | `app/api/blogs/migrate/route.js` | With `ADMIN_API_KEY` unset, the header `Bearer undefined` is accepted. The route creates `admin@example.com` with a password written in a source comment. |

## Known bugs

Each is a test of the correct behaviour that fails today (`test.fails`). `npm run bugs` shows each failure.

| Severity | Where | Bug |
|---|---|---|
| High | `app/api/upload` | No login check: anyone can upload images to the Cloudinary account. |
| High | `app/api/*` (JWT fallback) | A token signed with the placeholder secret `your-jwt-secret-key` is accepted when `JWT_SECRET` is unset. |
| High | `app/api/blogs/migrate` | `Bearer undefined` passes when `ADMIN_API_KEY` is unset. |
| High | `app/api/bookings/create*` | The price (and, in `/create`, the status) come from the browser: a booking can be made for ₹1 and created as "completed". |
| High | `app/bookings/details/[id]` | Loads and cancels without the Authorization header the API requires, so the page always fails ("Failed to load booking details") and cancelling from it can never work. |
| High | `app/bookings/hotel/[id]` | The page shows rupees (×83) but books the dollar amount; the email then shows that number with ₹ (₹750 for a ₹62,250 stay). |
| Medium | `app/destination-details` | AI text for transport is inserted with `dangerouslySetInnerHTML`. The prompt includes the destination from the URL, so a crafted link can lead to cross-site scripting. |
| Medium | `app/api/db/alter-bookings-table` | Anyone can run the schema-changing stored procedure. |
| Medium | `app/lib/email*.js` | User text (names, special requests) goes into email HTML unescaped: links or markup can be injected into mail sent from TripSage. |
| Medium | `app/lib/email.js` | When sending fails, the whole password-reset link (a working token) is printed to the server log. |
| Medium | `app/api/chat` | Earlier replies are passed to Gemini with role `assistant`; Gemini accepts only `user` and `model`, so the conversation breaks after the first answer. |
| Medium | hotel booking → `BookingCard`, `user-bookings` API, `/my-bookings` | The hotel page saves `{ name, location }`, but the display code reads `hotel_name` / `hotel_location`, so booked hotels appear as "Hotel Booking". `/my-bookings`, where both booking pages redirect, also ignores the names the API provides. |
| Medium | `app/bookings/travel/[id]` | The search page never caches its results, so the detail page re-runs the AI search to find the package. Real AI answers make up new ids each time, so with a Gemini key every package shows "not found". |
| Medium | `app/bookings/travel` | One AI search per keystroke of the destination. |
| Medium | `app/destination-details` | The overview is requested twice on every visit (two AI calls). |
| Medium | `app/blogs/edit/[id]` | Saving an edit drops the post's inline images (the six bundled posts have 17). |
| Medium | `app/blogs/new`, `edit` | In a paragraph containing a list, every line that is not a list item is dropped. |
| Medium | `app/budget-tracker/utils/storageUtils.js` | Importing a list of trips replaces all saved trips. |
| Low | `app/bookings/hotel/[id]` | The guest count is not checked against room capacity. |
| Low | `app/blogs` | `?mode=my` is ignored, so creating or deleting a post lands on "All Blogs". The login page also ignores `redirectTo`. |
| Low | `app/components/SearchBar.jsx` | Local dates go through `toISOString()`: in India the search asks for the day before the one picked. |
| Low | `app/budget-tracker` | Expense dates are stored as UTC midnight and shown in local time (a day early west of UTC). Deleting the last trip leaves it as the "active" trip. |
| Low | `app/destination-details` | The activity tips mention Mumbai for every destination. "$1,000 - $2,000" becomes "₹83 - ₹0". Text budget tiers show "₹800" next to "$800 USD". A text `distance` (as the prompt asks for) renders one row per character. |
| Low | `app/page.js` | Renders its own `<Navbar />` while the layout already adds one: two navbars on the home page. |
| Low | `app/api/auth/signup` | No minimum password length (reset requires 6). Emails are case-sensitive, so `Asha@x.com` and `asha@x.com` are two accounts. |
| Low | `app/api/auth/me` | A deleted account answers 500 instead of 404. |
| Low | `app/api/llm/travel-packages/search` | A numeric `duration` crashes the search (500). |
| Low | `app/contact-us` | The contact form has no submit handler; messages go nowhere. |

Also noted:
- **Placeholder controls:** the "Edit Profile", "Download PDF", "Email Confirmation", newsletter "Submit" and budget-tier tab buttons do nothing.
- **Duplicate id:** the budget page has two inputs with `id="amount"`, so the expense form's label points at the converter.
- **Developer tools that cannot work:** `/admin/bookings` and `/api/bookings/seed` need a Supabase Auth session, which this app never creates.
- **Debug routes:** `/api/debug-cookies` and `/api/auth/test` return error stack traces.
- **Retired image service:** images come from `source.unsplash.com`, which Unsplash shut down.
- **Deprecated AI model:** the hotel and package search call `gemini-pro`, which Google has deprecated. If it no longer answers, those searches always fall back to sample data, so check whether it still responds.
- **Hotel page without a hotel:** if the API returns no hotel, the page shows a raw JavaScript error instead of "Hotel Not Found".
- **Stale sample data:** the built-in packages have 2023 departure dates.
