# 📄 Personal Web Portfolio — RPD (Requirements / Product Document)

## 1. Product Overview

A modern full-stack **developer portfolio platform** built with Vite + React and Node.js.

The platform showcases:

* Skills
* Experience
* Projects
* Certifications

It includes a **secure admin dashboard** to manage content dynamically.

**Target audience:**

* Recruiters
* Hiring managers
* Freelance clients
* Tech peers

---

## 2. Core Objectives

* Present a strong **Cloud / DevSecOps Engineer profile**
* Highlight **real-world technical projects**
* Provide **dynamic content management**
* Ensure **clean UI + high performance**
* Demonstrate **fullstack capabilities (frontend + backend + auth)**

---

## 3. Tech Stack

### Frontend

* Vite + React
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB

### Hosting

* AWS Lightsail

---

## 4. High-Level Architecture

```
Frontend (React - Vite)
        ↓
Backend API (Node.js / Express)
        ↓
MongoDB
```

Admin flow:

```
Login → JWT Authentication → Admin Dashboard → CRUD operations
```

---

## 5. Features

## Public Portfolio

### Hero Section

* Name + Title
* Short tagline
* Call-to-action buttons

### About

* Professional summary
* Focus on DevOps / Cloud impact

### Skills

Grouped into:

* Cloud
* DevOps
* Security
* Programming
* Tools

### Projects (dynamic)

Each project includes:

* Title
* Description
* Tech stack
* GitHub URL
* Live demo (optional)

### Experience

* Company
* Role
* Responsibilities
* Timeline

### Certifications

* Certification name
* Issuer
* Date

### Contact

* Contact form (connected to backend)
* Social links

---

## 6. Admin Dashboard (Protected)

### Authentication

* Login system (JWT-based)
* Secure routes

### Content Management (CRUD)

* Projects
* Skills
* Experience
* Certifications

---

## 7. Data Models (MongoDB)

### Project

```json
{
  "title": "string",
  "description": "string",
  "stack": ["string"],
  "githubUrl": "string",
  "liveUrl": "string",
  "createdAt": "date"
}
```

### Skill

```json
{
  "name": "string",
  "category": "Cloud | DevOps | Security | Programming | Tools"
}
```

### Experience

```json
{
  "company": "string",
  "role": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date"
}
```

### Certification

```json
{
  "name": "string",
  "issuer": "string",
  "date": "date"
}
```

### User (Admin)

```json
{
  "username": "string",
  "password": "hashed"
}
```

---

## 8. UI/UX Requirements

### Design

* Modern and minimal
* Clean spacing and typography

### Theme

* Dark mode (default)
* Light mode toggle

### Colors

* Primary accent color
* Neutral backgrounds
* High contrast text

### Responsiveness

* Mobile-first
* Tablet and desktop optimized

---

## 9. Security Requirements

* JWT authentication
* Password hashing (bcrypt)
* Protected admin routes
* Use environment variables for secrets
* No sensitive data exposed in frontend

---

## 10. Performance Requirements

* Fast load time (Vite optimization)
* Lazy loading components
* Optimized images
* Minimal bundle size

---

## 11. Deployment Strategy

### AWS Lightsail Setup

Option 1 (simple):

* Single instance:

  * Node.js backend
  * React frontend served via Nginx
  * MongoDB

Option 2 (recommended):

* Frontend: static build (Nginx)
* Backend: Node.js service (PM2)
* Database: MongoDB (separate instance or managed)

---

## 12. Development Phases

### Phase 1 — Frontend MVP

* Build UI with static data
* Implement all sections

### Phase 2 — Backend

* Create API
* Connect MongoDB
* Implement authentication

### Phase 3 — Admin Panel

* Login system
* CRUD UI

### Phase 4 — Integration

* Replace static data with API calls

### Phase 5 — Deployment

* Deploy on AWS Lightsail
* Configure domain + HTTPS

---

## 13. Codex Execution Plan

### Frontend

```
Create a Vite React portfolio with Tailwind including sections: hero, about, skills, projects, experience, certifications, contact, with dark/light mode.
```

### Backend

```
Create a Node.js Express API with MongoDB models and JWT authentication.
```

### Admin Dashboard

```
Create a React admin dashboard with login and CRUD functionality.
```

### Integration

```
Connect frontend to backend API and replace static data.
```

### Deployment

```
Prepare the app for AWS Lightsail deployment using Nginx and PM2.
```

---

## 14. Success Criteria

* Clean and professional UI
* Fully responsive design
* Functional admin dashboard
* Secure authentication
* Dynamic content management
* Deployed and accessible online

---

## 15. Key Differentiators

* Fullstack portfolio (not static)
* Admin-controlled content
* Real DevOps-focused projects
* Clean architecture
* Production-ready deployment

---

## 16. Final Vision

This is not just a portfolio.

It is a:

> **Fullstack portfolio platform demonstrating real-world engineering skills**

