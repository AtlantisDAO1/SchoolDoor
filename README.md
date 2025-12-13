# SchoolDoor V0.1.0 Alpha

> **A citizen-led movement where parents, teachers, and schools co-create a transparent, trusted guide to education in India.**

## About

SchoolDoor is an open-source initiative designed to democratize access to information about education in India. We believe that finding the right school shouldn't be a mystery. By empowering parents, students, and educators to share their authentic experiences, we are building a platform that values **transparency**, **trust**, and **community**.

Our mission is to bridge the gap between schools and families, providing a comprehensive, data-driven, and community-verified guide to educational institutions across the country.

## Architecture & Tech Stack

This project is a monorepo containing both the backend and frontend services.

### Backend (`/SchoolDoor-Backend`)
-   **Framework**: FastAPI (Python)
-   **Database**: PostgreSQL / SQLAlchemy
-   **Key Features**:
    -   RESTful API for Schools, Reviews, and Users
    -   Role-based Access Control (Admin vs Member)
    -   Web Scraping Service for school data aggregation
    -   [Detailed UML Diagram](SchoolDoor-Backend/docs/backend_diagram.puml)

### Frontend (`/SchoolDoor-Frontend`)
-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS
-   **Language**: TypeScript
-   **Key Features**:
    -   Responsive Member & Admin Portals
    -   Alfred Chatbot Integration
    -   Interactive Data Visualization

## Features

### Member (Parent/Student) Features
-   **Dashboard**: A personalized hub to view your activity and stats.
-   **Add School Requests**: Submit requests to add missing schools.
-   **Write Reviews**: Share authentic experiences by writing detailed reviews.
-   **Track Requests**: View the status of your school addition requests.

### Admin Features
-   **Admin Dashboard**: Comprehensive overview of platform statistics.
-   **Moderation**: Review, approve, or reject school addition requests and user reviews.
-   **Data Management**: Edit school details and generate API keys.

### General Features
-   **Advanced Search**: Filter schools by location, board, fees, and rating.
-   **Alfred Chatbot**: AI-powered assistant for easy navigation.

## Getting Started

### Prerequisites
-   Node.js 20+
-   Python 3.10+
-   Docker (Optional, for containerized run)

### Quick Start (Manual)

**1. Backend Setup**
```bash
cd SchoolDoor-Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
# Server starts at http://localhost:6001
```

**2. Frontend Setup**
```bash
cd SchoolDoor-Frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

## Documentation

-   [Backend Documentation (API)](SchoolDoor-Backend/README.md)
-   [Frontend Documentation](SchoolDoor-Frontend/README.md)
-   [Backend UML Diagram](SchoolDoor-Backend/docs/backend_diagram.puml)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## Security

For security concerns, please email us at [support@dropchain.in](mailto:support@dropchain.in).

See our [Security Policy](SECURITY.md) for more details.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
