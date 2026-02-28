import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, FileText, LucideServerCog } from 'lucide-react';
import { TfiGallery } from "react-icons/tfi";

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <LucideServerCog className="h-8 w-8 text-[#5aa6f8]" />
              <h1 className="text-2xl font-bold text-gray-900">Maa Pitambara Tours and Travels</h1>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-4">
              <Link
                to="/form"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/form')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Form</span>
              </Link>

              <Link
                to="/admin/gallery"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/gallery')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TfiGallery className="h-4 w-4" />
                <span className="hidden sm:inline">Gallery</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <PenTool className="h-4 w-4" />
            <span className="text-sm">Management Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;