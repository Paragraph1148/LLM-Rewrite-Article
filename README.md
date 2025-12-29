## BeyondChats Assignment

This repository contains my submission for the Full Stack Developer Intern assignment at BeyondChats.
The goal of this project is to scrape blog articles, store them, update them using LLMs, and display
both original and updated versions through a simple frontend.

The work is divided into three phases as mentioned in the assignment.

---

### Tech Stack

- Node.js
- Express.js
- MySQL
- React

---

### Project Structure

The backend handles scraping, database operations, and automation logic.
The frontend is a small React app used to display articles.

---

### Phase Breakdown

**Phase 1: Scraping & CRUD**

- Scrapes the 5 oldest articles from the BeyondChats blogs section.
- Stores article data in MySQL.
- Provides CRUD APIs to manage articles.

**Phase 2: Article Updating using LLMs**

- Fetches original articles using internal APIs.
  (The scraper first fetches the last blogs page. If fewer than 5 articles are found, it fetches the previous page and combines results until 5 articles are collected.)
- Searches Google for related articles.
- Scrapes content from the top external articles.
- Uses an LLM to rewrite the original article based on the reference articles.
- Stores the updated version along with reference links.

**Phase 3: Frontend**

- Displays both original and updated articles.
- Simple and responsive UI focused on readability.

---

### Database Setup

1. Install MySQL locally.
2. Create a database (for example: `beyondchats`).
3. Run the schema file:

   mysql -u root -p beyondchats < backend/db/schema.sql

Database credentials are managed using environment variables.

---

### Design Notes

The scraper uses simple and defensive selectors to avoid breaking if the blog structure changes slightly.

I checked for an RSS/Atom feed as a cleaner way to fetch articles, but chose to scrape the blogs section
directly to stay aligned with the assignment requirement of scraping from the last page.

Backend code follows a basic service–controller structure to keep responsibilities separated and readable.

---

### Notes

The focus of this project is correctness, clarity, and following the assignment requirements without
over-engineering.
