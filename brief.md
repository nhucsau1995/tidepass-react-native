# Tidepass - Source Brief

## Title
Tidepass - Real-time Boat Charter Booking

## Description
Tidepass is a mobile marketplace for booking sailing catamarans, motor yachts, traditional phinisi boats and fast-boat transfers across Asia Pacific. Guests browse destinations such as the Whitsundays, Bali, Palawan, Fiji and Tahiti, search by date and party size, and see only boats that still have space. Seat counts come live from the operators' own charter systems, so the number a guest sees is the number that exists. When a guest picks a departure, the app holds their seats for ten minutes while they pay; if the card is declined or the timer runs out the seats go straight back on sale, and if another guest takes the last seats first the app says so clearly, charges nothing and offers the closest live alternatives. After booking, guests get a unique booking reference by email and SMS, can manage or cancel the trip (cancelled seats return to sale instantly) and receive weather or operational cancellation alerts. Charter operators get a console with feed health, today's fleet capacity and a switch that blocks a boat from every listing.

## Store links
Not yet published (proof of concept).

## Platform
Android demo, iOS-ready codebase (one Expo / React Native project).

## Category
Travel

## Features
- Destination discovery with fleet counts and a featured charter
- Search by destination, date and guests, filtered to boats with enough seats
- Fully booked state with the nearest dates that still have space and a seat alert
- Boat profiles with specs, rating and a 7-day availability strip
- Departure picker: month calendar (available / limited / full), time slots with live seats left, adults and children
- Live sync indicators per listing (operator PMS, agency API, manual calendar)
- Ten-minute seat hold with a countdown ring during checkout
- Automatic release of seats on a declined card or when the hold times out
- Last-seat race handling: exactly one booking wins, the other guest is not charged and sees live alternatives
- Unique booking references (TDP-YY-MMDD-XXXX) with email and SMS confirmation
- My trips (upcoming / past, empty state), booking detail with itinerary, skipper and meeting point
- Cancellation with refund breakdown, seats returned to sale instantly
- Weather and operational cancellation notifications with rebook
- Operator console: feed status, today's capacity, rejected conflicting feed bookings, block / unblock a boat

## Tech stack
- Expo SDK 58 / React Native 0.88, TypeScript, expo-router
- Zustand 5 for app state over a pure TypeScript availability engine
- Availability engine: per-departure inventory, seat holds with expiry, idempotent confirm, release, cancel, feed bookings, block, weather cancel (immutable state)
- node:test unit tests for the inventory rules
- Montserrat and Playfair Display (expo-google-fonts), Feather icons, react-native-svg, expo-linear-gradient
- Maestro flows + GitHub Actions Android emulator for the real screenshots and demo GIF
- Google Stitch design system (graphite + brass, 18 screens)
- Stack reason: the job does not name a mobile stack, so the account owner's default stack (Expo / React Native + Zustand + TypeScript) was used.

## Industry
Marine tourism, yacht and boat charter, travel booking

## Metrics
Unpublished proof of concept: no store ratings, downloads or users. Design from Google Stitch (18 screens, all built). Design QA on the real Android screenshots: 94 / 100 (grade A, marketplace profile), no Critical findings.

## Research notes
- Verified in unit tests: the last seat cannot be double-booked (capacity 10, 9 booked, two guests race, exactly one wins), seats leave sale at hold time, a declined card and an expired hold release seats, a retried confirm books once, cancellation releases seats instantly, blocked boats show zero availability, weather cancellation refunds and removes the departure, feed bookings that do not fit are rejected instead of overbooking, booking references stay unique across 10,000 bookings, and a 2,000-step mixed load never exceeds capacity.
- Verified on the emulator: the screens and the demo walkthrough in the README were captured from the release build.
- Mocked: operator PMS and agency feeds are simulated in-app (a background tick books seats on boats outside the demo path through the same engine); payments, email and SMS are simulated; boats, operators, prices and ratings are fixture data; the app runs on a fixed "today" (Fri 16 Oct 2026) so the seeded calendar lines up.
- The demo's lost-the-last-seats moment is a scripted operator-system booking arriving in the same instant as the guest's hold, resolved by the real engine.
- Scope: the brief covers web, mobile and an admin; this POC is one mobile app proving the guest booking loop, with the operator side reduced to an in-app console. Next steps: a web booking front end and an operator web portal on the same inventory API.
- Next steps (backend): server-side inventory with transactional seat holds and TTL, real operator connectors (polling with rate limits or webhooks, conflict handling when the operator system is the source of truth), idempotency keys on booking creation, timezone-aware departures per destination, Stripe payments, push notifications, multi-currency pricing.
- Known issues from the design QA (open): checkout does not show the cancellation terms before Pay (Major, shown only on the booking after paying); the dimmed checkout behind the last-seats sheet shows a 00:00 timer; available vs limited calendar days differ by dot color only; Search and Bookings tab icons are a search glass and a bookmark instead of the designed calendar-search and ticket; alternative-row notes truncate; no 'get help' entry on a booking; the 'Test decline' demo link is visible in checkout.
- Live pills pulse three times then settle, and sync captions step every 5 s: an always-on pulse on every pill slowed UI automation on the CI emulator about 4x.
