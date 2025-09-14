import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--primary-color)',
  text = 'Chargement...'
}) => {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  return (
    <div className="loading-container">
      <div 
        className="loading-spinner"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderColor: `${color}20`,
          borderTopColor: color
        }}
      />
      {text && <p className="loading-text">{text}</p>}
      
      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }
        
        .loading-spinner {
          border: 3px solid;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 