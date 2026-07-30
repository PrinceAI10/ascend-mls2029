import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ code, onError }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        containerRef.current.innerHTML = '';
        
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          themeVariables: {
            primaryColor: '#FFB800',
            primaryTextColor: '#1B1405',
            primaryBorderColor: '#1B1405',
            lineColor: '#1B1405',
            secondaryColor: '#f0f4f8',
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
          securityLevel: 'loose',
        });

        const { svg } = await mermaid.render('mermaid-diagram', code);
        containerRef.current.innerHTML = svg;
        
      } catch (err) {
        console.error('Mermaid error:', err);
        if (onError) {
          onError(err.message);
        }
      }
    };

    renderDiagram();
  }, [code, onError]);

  return (
    <div 
      ref={containerRef}
      style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        margin: '10px 0',
        border: '1px solid #e2e8f0',
        overflow: 'auto',
        minHeight: '100px',
      }}
    />
  );
};

export default MermaidDiagram;