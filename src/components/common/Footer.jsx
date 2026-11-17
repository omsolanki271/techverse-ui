import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Terminal, Code2, Mail } from 'lucide-react';
import categoryService from '../../services/categoryService';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAllCategories()
      .then(cats => setCategories((cats || []).slice(0, 5)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-techverse-green text-techverse-eggshell pt-20 pb-10 border-t border-techverse-olive/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1 text-center md:text-left">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-black tracking-tighter text-techverse-eggshell">
                TECH<span className="text-techverse-olive">VERSE</span>
              </span>
            </Link>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              Ideas shaping the technology of tomorrow. A publication for developers, engineers, and tech enthusiasts.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="hover:text-techverse-olive transition-colors text-sm">All Articles</Link></li>
              {categories.map(cat => (
                <li key={cat.categoryId}>
                  <Link to={`/category/${cat.categoryId}`} className="hover:text-techverse-olive transition-colors text-sm">
                    {cat.categoryTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="hover:text-techverse-olive transition-colors text-sm">Explore Stories</Link></li>
              <li><Link to="/dashboard/articles/new" className="hover:text-techverse-olive transition-colors text-sm">Write an Article</Link></li>
              <li><Link to="/dashboard" className="hover:text-techverse-olive transition-colors text-sm">User Dashboard</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">About TechVerse</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              Empowering writers and thinkers to share knowledge, research, and stories across technology, software engineering, and artificial intelligence.
            </p>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-techverse-eggshell/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs opacity-60 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TechVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
