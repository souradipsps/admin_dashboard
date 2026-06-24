# Admin Dashboard

A responsive **Admin Dashboard** built with **React + TypeScript + Tailwind CSS + Vite**.  
This project is designed to manage recruitment workflows, user data, and administrative tasks with a clean UI and mobile-friendly design.

---

## 🚀 Features
- 📊 **Dashboard Overview** – Key metrics and analytics
- 👥 **User Management** – Add, edit, and manage users
- 📝 **Recruitment Portal** – Job postings and candidate tracking
- 📱 **Responsive Design** – Optimized for mobile and desktop
- ⚡ **Fast Build** – Powered by Vite for lightning-fast development
- 🎨 **Tailwind CSS** – Utility-first styling
- 🔒 **Authentication Ready** – Extendable for secure login systems
- 🔄 **CI/CD** – GitHub Actions workflow to keep Render app awake

---

## 📂 Project Structure

admin_dashboard/
├── .bolt/                     # Initial commit files
├── .github/
│   └── workflows/
│       └── keep_render_awake.yml   # GitHub Action
├── public/                    # Static assets (HTML, CSS, images)
├── src/                       # Source code (React + TypeScript)
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-level views
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # Context providers
│   ├── styles/                # Global styles
│   └── main.tsx               # App entry point
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── index.html                 # Main HTML entry point
├── package-lock.json          # Dependency lock file
├── package.json               # Dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.app.json          # TypeScript config for app
├── tsconfig.json              # Root TypeScript config
├── tsconfig.node.json         # TypeScript config for Node
├── vite.config.ts             # Vite build & server configuration
└── README.md                  # Documentation

Code

---

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Build Tool**: Vite
- **Linting**: ESLint
- **Deployment**: Render
- **CI/CD**: GitHub Actions

---

## ⚙️ Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/souradipsps/admin_dashboard.git
cd admin_dashboard
npm install
▶️ Development
Run the development server:

bash
npm run dev
Build for production:

bash
npm run build
