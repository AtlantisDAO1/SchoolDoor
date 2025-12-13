# Frontend Architecture

This document provides an overview of the SchoolDoor Frontend architecture.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context & Hooks
- **Data Fetching**: Native `fetch` with custom wrappers

## Directory Structure

```
/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication related pages (grouped route)
│   ├── api/              # Internal API routes (proxy to backend)
│   └── ...               # Other application routes
├── components/           # Reusable UI components
├── lib/                  # Utility functions and configuration
│   ├── config.ts         # Centralized configuration
│   ├── api-client.ts     # Wrapper for fetch requests
│   └── ...
├── public/               # Static assets
└── docs/                 # Documentation
```

## Key Concepts

### API Integration

We use a proxy pattern for API requests. The frontend (browser) makes requests to the Next.js API routes (`/app/api`), which then forward the requests to the actual Backend API. This avoids exposing the Backend API URL and keys to the client.

- **Client-side**: Uses `fetch` to call `/api/...`
- **Server-side (Next.js)**: Uses `backendFetch` from `lib/api-client.ts` to call the backend.

### Authentication

Authentication is handled via HTTP-only cookies.
- **Admin**: `schooldoor_admin_token`
- **Member**: `schooldoor_member_token`

These tokens are set by the Next.js API routes upon successful login and are automatically sent with subsequent requests to the Next.js server.

### Styling

We use Tailwind CSS for styling. Global styles are defined in `app/globals.css`. We follow a utility-first approach.
