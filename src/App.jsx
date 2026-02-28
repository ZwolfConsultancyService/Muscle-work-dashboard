import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './component/Layout';
import GalleryList from './component/gallery/GalleryList';
import GalleryForm from './component/gallery/GalleryForm';
import GalleryDetail from './component/gallery/GalleryDetail';
import AppointmentDashboard from './component/AppointmentDashboard/AppointmentDashboard';
import './index.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App">
        <Layout>
          <Routes>

            {/* Form Dashboard Route */}
            <Route path="/form" element={<AppointmentDashboard />} />

            {/* Gallery Routes */}
            <Route path="/admin/gallery"     element={<GalleryList />} />
            <Route path="/admin/gallery/add" element={<GalleryForm />} />
            <Route path="/admin/gallery/:id" element={<GalleryDetail />} />

            {/* Redirect everything else to gallery */}
            <Route path="*" element={<Navigate to="/admin/gallery" replace />} />

          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
          }}
        />
      </div>
    </Router>
  );
}

export default App;