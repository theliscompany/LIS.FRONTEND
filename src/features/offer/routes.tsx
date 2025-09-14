import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DraftQuotes from './pages/DraftQuotes';
import QuoteManagement from './pages/QuoteManagement';
import ApprovedQuotes from './pages/ApprovedQuotes';
import QuoteViewer from './components/QuoteViewer';

const OfferRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Liste des brouillons */}
      <Route path="/draft-quotes" element={<DraftQuotes />} />
      
      {/* Gestion d'un devis avec ses options multiples */}
      <Route path="/quote-management/:quoteId" element={<QuoteManagement />} />
      
      {/* Devis approuvés */}
      <Route path="/approved-quotes" element={<ApprovedQuotes />} />
      
      {/* Visualisation d'un devis */}
      <Route path="/quote-viewer/:quoteId" element={<QuoteViewer />} />
      
      {/* Route par défaut - rediriger vers les brouillons */}
      <Route path="/" element={<DraftQuotes />} />
    </Routes>
  );
};

export default OfferRoutes;
