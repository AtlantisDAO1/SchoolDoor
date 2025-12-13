# SchoolDoor

> **A citizen-led movement where parents, teachers, and schools co-create a transparent, trusted guide to education in India.**

## Table of Contents

- [About](#about)
- [Features](#features)
  - [Member (Parent/Student) Features](#member-parentstudent-features)
  - [Admin Features](#admin-features)
  - [General Features](#general-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Security Policy](#security-policy)
- [License](#license)

## About

SchoolDoor is an open-source initiative designed to democratize access to information about education in India. We believe that finding the right school shouldn't be a mystery. By empowering parents, students, and educators to share their authentic experiences, we are building a platform that values **transparency**, **trust**, and **community**.

Our mission is to bridge the gap between schools and families, providing a comprehensive, data-driven, and community-verified guide to educational institutions across the country.

## Features

### Member (Parent/Student) Features
The Member portal is designed for parents and students to engage with the platform.
- **Secure Login/Signup**: Easy account creation and secure authentication.
- **Dashboard**: A personalized hub to view your activity and stats.
- **Add School Requests**: Members can contribute to the database by submitting requests to add missing schools.
- **Write Reviews**: Share authentic experiences by writing detailed reviews for schools.
- **My Reviews**: Manage and view the history of all reviews you have submitted.
- **Track Requests**: View the status of your school addition requests (Pending, Approved, Rejected).

### Admin Features
The Admin portal provides powerful tools for platform management.
- **Admin Dashboard**: Comprehensive overview of platform statistics (Total Schools, Reviews, Users).
- **School Request Management**: Review, approve, or reject school addition requests submitted by members.
- **Review Management**: Moderate user-submitted reviews to ensure quality and adherence to guidelines.
- **School Management**: Edit and update school details to ensure data accuracy.
- **API Key Management**: Generate and manage API keys for external integrations.

### General Features
- **Advanced Search**: Filter schools by location, board, fees, and rating.
- **Alfred Chatbot**: An AI-powered assistant to help users find information and navigate the platform.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Containerization**: Docker

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Install
1.  **Clone the repo:**
    ```bash
    git clone https://github.com/AtlantisDAO1/SchoolDoor.git
    cd SchoolDoor/SchoolDoor-Frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment:**
    ```bash
    cp .env.example .env.local
    # Fill in your keys in .env.local
    ```
4.  **Run Dev Server:**
    ```bash
    npm run dev
    ```

For detailed setup instructions, including Docker and Self-Hosting, see the [Installation Guide](docs/installation.md).

## Documentation

- 📖 **[Installation Guide](docs/installation.md)**: Detailed setup and deployment instructions.
- 🏗️ **[Architecture Overview](docs/architecture.md)**: Understanding the codebase structure and design.

## Roadmap

This document outlines the high-level roadmap for SchoolDoor.

### Phase 1: Foundation (Current)
- [x] Basic School Listing & Search
- [x] User Authentication (Member & Admin)
- [x] Review System
- [x] Admin Dashboard
- [x] Alfred Chatbot Integration

### Phase 2: Enhanced Engagement (Upcoming)
- [ ] Real-time Chat between Parents and Schools
- [ ] Advanced Analytics for Admins
- [ ] Multi-language Support

### Phase 3: Ecosystem Growth
- [ ] API for Third-party Integrations
- [ ] School Verification System
- [ ] Community Forums

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](../CONTRIBUTING.md) for details on how to get started, our development workflow, and coding standards.

## Code of Conduct

Please review our [Code of Conduct](../CONTRIBUTING.md#code-of-conduct) before participating.

## Security Policy

For security concerns, please email us at [security@schooldoor.in](mailto:admin@schooldoor.in).

## License

This project is licensed under the terms of the [MIT License](../LICENSE).

