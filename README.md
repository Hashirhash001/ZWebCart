<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# No Code Website Builder Backend (NestJS + Prisma + PostgreSQL)

A modular NestJS backend for a customizable **multi-store** commerce platform.
It uses a **central database** to manage stores and resolves each store’s own database connection dynamically (store DB URL is stored encrypted and decrypted at runtime).

## Tech Stack
- Backend: NestJS (TypeScript)
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT (Guards)
- Validation: DTOs + ValidationPipe (recommended) [web:195]

## Architecture (High Level)
- **Central DB**: stores metadata about stores (including encrypted `dbUrl`).
- **Store DB**: each store can have its own database (resolved using `storeId` in JWT).
- **Guards**: decode JWT, validate token, resolve `storeId`, fetch store from central DB, decrypt store DB URL, and attach `storeId` + `storeDbUrl` to the request.

## Modules / Features
- Store authentication (`src/store-auth`)
- Google authentication (`src/central/google-auth`) (optional)
- Store modules (`src/stores/*`):
  - Products
  - Category
  - Cart
  - Order
  - Wishlist
  - Theme customisation (themes, pages, sections)
- Guards for protected routes (admin/frontStore/store)
- DTO-driven request contracts (per-module `dtos/`) [web:195]

## DTOs & Validation
- Each module contains `dtos/` that define request payloads (create/update DTOs).
- DTOs can be validated using NestJS `ValidationPipe` (commonly used to validate and sanitize incoming requests). [web:188]

## Folder Structure
- `src/central/*` : central modules (e.g., google auth, shared utilities)
- `src/stores/*` : store modules (auth, products, cart, order, wishlist, theme-customisation)
- `src/guards/*` : guards (admin/frontStore/store)
- `prisma/` : schemas, migrations, generated clients
  - `central-schema.prisma`
  - `schema.prisma` (store schema)
  - `migrations/`
  - `generated-central/`
  - `generated-store/`

## Requirements
- Node.js (LTS recommended)
- PostgreSQL
- npm / yarn / pnpm

## Environment Variables
Create `.env` in the project root:

```env
# App
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET="change_me"
JWT_EXPIRES_IN="7d"

# Central DB (used by PrismaCentralService)
CENTRAL_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/CENTRAL_DB?schema=public"

# Crypto (used to encrypt/decrypt store dbUrl)
CRYPTO_SECRET_KEY="change_me"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL=""