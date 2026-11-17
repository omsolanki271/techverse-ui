# 🚀 TechVerse UI - Modern Developer Community & Tech Blogging Platform

TechVerse UI is the sleek, high-performance web frontend for **TechVerse** — an modern developer blogging platform and tech community hub. Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, and **Axios**, TechVerse delivers a premium user experience across public readers, author dashboards, and administrative controls.

---

## 🌟 Key Features

### 📖 Public Platform
- **Landing Page**: Dynamic hero banners, featured tech articles, top author spotlights, and interactive category exploration with instant filter navigation.
- **Explore Stories**: Multi-faceted content discovery with search indexing, category filtering, and paginated article views.
- **Article Reader & Comments**: High-readability typography, author cards, article metadata, and interactive community commenting system.
- **Author Profiles**: Dedicated public profile pages displaying author biographies, social links, and published articles.
- **Authentication**: Secure Login and Registration flows powered by JWT token authentication.

### ✍️ User & Author Dashboard
- **Overview & Statistics**: Personalized publishing overview and reading metrics.
- **Article Publishing & Editor**: Full creation, editing, and management of developer articles.
- **Media Asset Manager**: Personal image and media asset management.
- **User Profile Management**:
  - **Personal Details**: Update name, contact email, mobile number, location, and bio.
  - **Social Profiles**: Connect GitHub, LinkedIn, and Instagram profiles.
  - **Account Security**: Secure password management featuring **Existing Password Verification** before password updates.

### 🛡️ Admin Panel
- **System Overview**: Platform analytics tracking total users, posts, categories, and comments.
- **User Management**: Comprehensive user administration including role assignments (`ROLE_USER`, `ROLE_ADMIN`) and account actions.
- **Category Management**: Create, edit, and organize technology categories.
- **Post & Comment Moderation**: System-wide content moderation controls.
- **Global Media Library**: Centralized media library managing all uploaded assets across the application.
- **Admin Profile Management**: Specialized admin profile controls with instant global layout context synchronization (`AuthContext`).

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Build Tool & HMR** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons & UI Elements** | [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Data Viz / Charts** | [Recharts](https://recharts.org/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Backend API**: TechVerse Spring Boot REST API running locally or remotely (default: `http://localhost:8080/api/v1`)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/omsolanki271/techverse-ui.git
   cd techverse-ui
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and builds the production bundle in the `dist` folder. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs `oxlint` static code analysis checks. |

---

## 📁 Project Structure

```
techverse-ui/
├── src/
│   ├── assets/          # Static branding assets and images
│   ├── components/      # Reusable UI components & layouts
│   │   ├── common/      # Loaders, toasts, confirmation modals
│   │   └── layout/      # MainLayout, DashboardLayout, AdminLayout
│   ├── context/         # AuthContext, ToastContext, ConfirmContext
│   ├── data/            # Static configuration & fallback data
│   ├── pages/           # Page views categorized by scope
│   │   ├── admin/       # AdminOverview, AdminUsers, AdminProfile, etc.
│   │   ├── auth/        # Login, Register
│   │   ├── dashboard/   # Overview, Editor, MyMedia, Profile, etc.
│   │   └── public/      # LandingPage, Explore, ArticleDetails, AuthorProfile
│   ├── routes/          # ProtectedRoute and AdminRoute guards
│   ├── services/        # API service modules (api, authService, userService, postService, etc.)
│   ├── App.jsx          # App router configuration
│   ├── index.css        # Global Tailwind CSS directives & custom utility classes
│   └── main.jsx         # Application entry point
├── package.json
└── vite.config.js
```

---

## 🔒 Security Features
- **JWT Authentication**: Secured Bearer token headers attached via Axios request interceptors.
- **Route Authorization**: `AdminRoute` and `ProtectedRoute` components guarding admin and user dashboard paths.
- **Identity Verification**: Two-step existing password verification required prior to processing password change requests in account settings.

---

## 📄 License
Distributed under the **MIT License**.
