# 📅 Scheduly

**Your Routine, Simplified**

[![Version](https://img.shields.io/badge/version-v2.30.0-blue.svg)](https://github.com/rmia46/scheduly)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Frmia46.github.io%2Fscheduly\&logo=google-chrome\&logoColor=white\&label=Live%20Demo)](https://rmia46.github.io/scheduly/)
![GitHub Repo stars](https://img.shields.io/github/stars/rmia46/scheduly?style=social)
![GitHub forks](https://img.shields.io/github/forks/rmia46/scheduly?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/rmia46/scheduly)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=rmia46.scheduly)

---

A modern, responsive web application for **creating, customizing, and sharing weekly academic schedules**. Built with vanilla TypeScript and Tailwind CSS for speed, aesthetics, and flexible timetable management.

![Scheduly Screenshot](https://i.ibb.co.com/JWpYCK37/Screenshot-2026-09-21-at-04-57-36-Scheduly-Your-Routine-Simplified.png)

---

## 🚀 Live Demo

👉 **[Launch Scheduly](https://rmia46.github.io/scheduly/)**

---

## ✨ Features

- **Multi-Schedule Course Creator**: Add courses across multiple days (e.g. Sunday & Tuesday) and multiple time slots in a single click.
- **Interactive Timetable Grid**: 
  - Click any cell to quickly prefill day & slot.
  - Smooth drag-and-drop course rescheduling with ghost projection preview.
  - Cascading card deck layout when multiple courses occupy the same cell.
- **Schedule Conflict Detector**: Instant visual alerts with soft rose highlighting and clash badges when overlapping classes share the same slot.
- **Share & Sync**:
  - **Zero-Server Share Link**: Share entire routines via client-side URL hash fragments (`#routine=...`).
  - **Import Shared Link**: Paste any shared link or URL fragment to import routines into your workspace without modifying existing data.
  - **Recurring Calendar Export (`.ics`)**: Export weekly class schedules directly to Google Calendar, Apple Calendar, or Outlook with custom recurring duration (1 to 12 months).
  - **Vector PDF & High-Res PNG**: Crystal-clear exports for printing or digital sharing.
- **Full History (Undo / Redo)**: Seamless `Ctrl+Z` / `Ctrl+Y` support for all routine actions, moves, and color updates.
- **Theme Studio**: 5 harmonious analogous color themes (**Ocean**, **Grass**, **Lemon**, **Cherry**, and **Grape**) with intelligent contrast calculations and automatic color palette reshuffling.
- **University Presets**: One-click standard North South University (NSU) slot loader.
- **100% Client-Side & Private**: Instant auto-saving to local storage with zero server tracking or external database requirements.

---

## 🛠 Tech Stack

- **Core**: Vanilla TypeScript (No framework bloat)
- **Styling**: Tailwind CSS v4 + Material 3 Design Tokens
- **Bundler**: Vite
- **Export Engines**: `jspdf`, `jspdf-autotable`, `html-to-image`

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/rmia46/scheduly.git
cd scheduly

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 👤 Author

Developed with care by **Roman Mia** ([@rmia46](https://github.com/rmia46)).
Contributions and feature requests are welcome!
