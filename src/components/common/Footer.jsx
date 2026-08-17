import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Terminal, Code2, Mail } from 'lucide-react';

const Footer = () => {
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
              Ideas shaping the technology of tomorrow. A premium publication for developers, engineers, and tech enthusiasts.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="hover:text-techverse-olive transition-colors"><Globe size={20} /></a>
              <a href="#" className="hover:text-techverse-olive transition-colors"><Terminal size={20} /></a>
              <a href="#" className="hover:text-techverse-olive transition-colors"><Code2 size={20} /></a>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="hover:text-techverse-olive transition-colors text-sm">All Articles</Link></li>
              <li><Link to="/category/ai" className="hover:text-techverse-olive transition-colors text-sm">Artificial Intelligence</Link></li>
              <li><Link to="/category/programming" className="hover:text-techverse-olive transition-colors text-sm">Programming</Link></li>
              <li><Link to="/category/web-development" className="hover:text-techverse-olive transition-colors text-sm">Web Development</Link></li>
              <li><Link to="/category/cyber-security" className="hover:text-techverse-olive transition-colors text-sm">Cyber Security</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-techverse-olive transition-colors text-sm">About Us</Link></li>
              <li><Link to="/authors" className="hover:text-techverse-olive transition-colors text-sm">Authors</Link></li>
              <li><Link to="/write" className="hover:text-techverse-olive transition-colors text-sm">Write for TechVerse</Link></li>
              <li><Link to="/dashboard" className="hover:text-techverse-olive transition-colors text-sm">Dashboard</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold mb-6 text-techverse-olive">Newsletter</h4>
            <p className="text-sm opacity-80 mb-4">Stay updated with the latest in tech.</p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-techverse-green opacity-50" />
                </div>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full pl-10 pr-4 py-3 bg-techverse-eggshell text-techverse-green rounded-sm focus:outline-none focus:ring-2 focus:ring-techverse-olive"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-techverse-olive hover:bg-techverse-olive/90 text-techverse-green font-bold py-3 rounded-sm transition-colors">
                Subscribe
              </button>
            </form>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-techverse-eggshell/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs opacity-60 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TechVerse. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs opacity-60">
            <Link to="/privacy" className="hover:text-techverse-olive transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-techverse-olive transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
