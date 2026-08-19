import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts & Guards
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Components
import InitialLoader from './components/common/InitialLoader';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Explore from './pages/public/Explore';
import ArticleDetails from './pages/public/ArticleDetails';
// const CategoryPage = () => <div className="pt-32 text-center text-4xl font-black">Category Page</div>;
// const SearchPage = () => <div className="pt-32 text-center text-4xl font-black">Search Page</div>;

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import DashboardArticles from './pages/dashboard/DashboardArticles';
import Editor from './pages/dashboard/Editor';
import MyMedia from './pages/dashboard/MyMedia';
import DashboardCategories from './pages/dashboard/DashboardCategories';

const DashboardComments = () => <div className="p-8 text-2xl font-bold text-techverse-green">Comments</div>;

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPosts from './pages/admin/AdminPosts';
import AdminComments from './pages/admin/AdminComments';
import AdminMedia from './pages/admin/AdminMedia';

// Placeholders for Public
const CategoryPage = () => <div className="pt-32 text-center text-4xl font-black">Category Page</div>;
const SearchPage = () => <div className="pt-32 text-center text-4xl font-black">Search Page</div>;
const AuthorProfile = () => <div className="pt-32 text-center text-4xl font-black">Author Profile</div>;

function App() {
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Basic initialization could go here
    // simulate a small delay for the initial loader to feel premium
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {loading && !appReady ? (
          <InitialLoader key="loader" onComplete={() => setLoading(false)} />
        ) : (
          <Routes key="routes">
            {/* Public Routes with Main Navbar & Footer */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="explore" element={<Explore />} />
              <Route path="article/:id" element={<ArticleDetails />} />
              <Route path="category/:categoryId" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="author/:username" element={<AuthorProfile />} />

              {/* Standalone Auth Routes embedded in MainLayout to show Navbar, or you can keep them out */}
              <Route path="auth/login" element={<Login />} />
              <Route path="auth/register" element={<Register />} />
            </Route>

            {/* Open User Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="articles" element={<DashboardArticles />} />
              <Route path="articles/new" element={<Editor />} />
              <Route path="articles/:id/edit" element={<Editor />} />
              <Route path="media" element={<MyMedia />} />
              <Route path="categories" element={<DashboardCategories />} />
              <Route path="comments" element={<DashboardComments />} />
            </Route>
            {/* Profile redirects to dashboard overview for now */}
            <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

            {/* Open Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="media" element={<AdminMedia />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <MainLayout>
                <div className="pt-40 pb-32 text-center flex flex-col items-center min-h-screen">
                  <h1 className="text-6xl font-black text-techverse-green mb-4">404</h1>
                  <h2 className="text-2xl font-bold text-techverse-green mb-8">Page Not Found</h2>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </MainLayout>
            } />
          </Routes>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
