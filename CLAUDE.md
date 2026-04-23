# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
node server.js        # Start the server (default port 3000)
npx mix               # Build frontend assets once (JS + SCSS → public/)
npx mix watch         # Watch and rebuild assets on change
```

Requires a `.env` file with `MONGO_URL`, `COOKIE_SECRET`, and `PORT`.

> **No test suite is configured.**

## Architecture Overview

FeastFly is a real-time food delivery web app built with **Express.js + EJS** server-side rendering, **MongoDB/Mongoose**, and **Socket.IO** for live order status updates.

### Request Flow

- `routes/web.js` — all routes wired here via a gateway function called in `server.js`
- Controllers in `app/http/controllers/` handle request logic. Three groups:
  - `homeController.js` — lists menu items
  - `customers/` — cart and order placement/viewing for authenticated customers
  - `admin/` — order listing and status updates for admins
- Middlewares in `app/http/middlewares/`: `auth` (redirects unauthenticated users to `/login`), `guest` (redirects authenticated users away from login/register), `admin` (guards admin routes)

### Real-Time Order Updates (Socket.IO + EventEmitter)

Node's built-in `EventEmitter` is stored on the Express app instance (`app.set('eventEmitter', eventEmitter)`) and retrieved in controllers via `req.app.get('eventEmitter')`. Two events drive real-time behavior:

- `orderPlaced` — emitted after a customer places an order → Socket.IO broadcasts to `adminRoom` so the admin dashboard refreshes without polling
- `orderUpdated` — emitted after an admin changes order status → Socket.IO emits to `order_<id>` room so the customer's order-tracking page updates live

Customers join their order room on the front end via `socket.emit('join', orderId)`.

### Session & Auth

- `express-session` with in-memory store (no persistence across restarts). Session holds the cart (`req.session.cart`).
- Passport.js local strategy authenticates against the `users` collection using bcrypt. The deserializer returns a Mongoose query object rather than a resolved user document — controllers access the user ID via `req.user._conditions._id`.

### Asset Pipeline

Laravel Mix (`webpack.mix.js`) compiles:

- `resources/js/app.js` → `public/js/app.js`
- `resources/scss/app.scss` → `public/css/app.css`

### Data Models

**`Item`** (`app/models/item.js`) — menu items: `name`, `image`, `price`, `size`, timestamps.

**`Order`** (`app/models/order.js`) — `customerId` (ref `User`), `items` (Object — cart snapshot), `phone`, `address`, `paymentType` (default `"COD"`), `status` (default `"order_placed"`), timestamps.

**`User`** (`app/models/user.js`) — standard auth user with `email` and bcrypt `password`.

### Views

EJS templates in `resources/views/`, using `express-ejs-layouts` with `layout.ejs` as the base. Subdirectories: `auth/`, `customers/`, `admin/`. Flash messages (`req.flash`) are used for form errors and success notices.
