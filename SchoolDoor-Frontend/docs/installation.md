# Installation & Setup Guide

This guide covers how to set up the SchoolDoor Frontend for local development and self-hosting.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Usually comes with Node.js.
- **Docker**: Required if you plan to run the application in a container.

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/schooldoor-frontend.git
cd schooldoor-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory. You can start by copying the example:

```bash
cp .env.example .env.local
```

**Required Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_API_URL` | URL of the backend API | `http://localhost:6001/api/v1` |
| `SCHOOLDOR_API_KEY` | API Key for backend requests | (Required) |
| `ALFRED_CHAT_API_KEY` | API Key for the AI Chatbot | (Required) |

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Docker Setup

We provide a `Makefile` and `docker-compose` configuration for easy container management.

### Development Mode

Run the application in a Docker container with hot-reloading enabled:

```bash
make dev
```

To stop the container:

```bash
make stop
```

### Production Mode

To build and run the production image:

```bash
make prod
```

Ensure you have a `.env.prod` file created with your production secrets before running this command.

## Self-Hosting

To deploy SchoolDoor Frontend on your own infrastructure:

1.  **Build the Docker Image:**
    ```bash
    docker build -t schooldoor-frontend .
    ```

2.  **Run the Container:**
    ```bash
    docker run -d \
      -p 3000:3000 \
      -e BACKEND_API_URL=https://api.yourdomain.com/v1 \
      -e SCHOOLDOR_API_KEY=your_api_key \
      -e ALFRED_CHAT_API_KEY=your_alfred_key \
      schooldoor-frontend
    ```

Alternatively, you can deploy to Vercel, Netlify, or any other Next.js compatible hosting provider.
