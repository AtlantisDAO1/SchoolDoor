# Release Notes - v0.1.0 Alpha

**Date:** 2025-12-13
**Version:** v0.1.0

## 🚀 Launch: SchoolDoor Monorepo

We are excited to announce the first alpha release of **SchoolDoor**, the community-driven platform for transparent school reviews in India. This release focuses on establishing the core infrastructure and essential features for Members and Admins.

### 🌟 Key Features

#### Core Platform
-   **Monorepo Structure**: Unified Backend (FastAPI) and Frontend (Next.js) codebase.
-   **Containerization**: Docker support for easy deployment.
-   **Authentication**: Secure JWT-based auth for Members and Admins.

#### Frontend (Next.js 15)
-   **Member Portal**: Dashboard, profile management, and review history.
-   **Admin Portal**: comprehensive management of schools, requests, and reviews.
-   **Alfred Chatbot**: AI-powered assistant for site navigation.
-   **Responsive Design**: Mobile-first UI with Tailwind CSS.

#### Backend (FastAPI)
-   **RESTful API**: Robust endpoints for schools, reviews, and ratings.
-   **Data Models**: Complete schema for the Indian education system (Boards, Grades, Facilities).
-   **Web Scraper**: Automated data aggregation service.

### 🛠️ Infrastructure
-   **Database**: PostgreSQL integration with SQLAlchemy ORM.
-   **Security**: Role-based access control (RBAC).

## 📝 Usage

To get started with this release:

```bash
git clone git@github.com:AtlantisDAO1/SchoolDoor.git
cd SchoolDoor
# Follow README.md for setup instructions
```

## 🐛 Known Issues
-   Search filters are currently case-sensitive in some edge cases.
-   Mobile view for the admin dashboard is in beta.

---
*Built with ❤️ by the SchoolDoor Team*
