// src/components/Documentation.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

interface DocumentationProps {
  file: string;
}

const Documentation: React.FC<DocumentationProps> = ({ file }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(file)
      .then((response) => response.text())
      .then((text) => setContent(text));
  }, [file]);

  return <ReactMarkdown>{content}</ReactMarkdown>;
};

export default Documentation;
