// src/pages/DocsPage.tsx
import React from 'react';
import Documentation from '../components/Documentation';

const DocsPage: React.FC = () => {
  return (
    <div>
      <h1>Documentation</h1>
      <Documentation file="/docs/Header.md" />
    </div>
  );
};

export default DocsPage;
