import React, { useEffect, useRef, useState } from 'react';

interface StreamItem {
  id: string;
  content: string;
  type: 'keyword' | 'symbol' | 'string' | 'comment';
  top: number;
  delay: number;
}

interface NeuronNode {
  id: string;
  x: number;
  y: number;
  active: boolean;
  connections: string[];
}

export function DataStreams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [neurons, setNeurons] = useState<NeuronNode[]>([]);
  const [streamItems, setStreamItems] = useState<StreamItem[]>([]);

  // Code snippets for the streams
  const codeSnippets = [
    { content: 'const', type: 'keyword' as const },
    { content: 'function', type: 'keyword' as const },
    { content: 'return', type: 'keyword' as const },
    { content: 'import', type: 'keyword' as const },
    { content: 'export', type: 'keyword' as const },
    { content: 'async', type: 'keyword' as const },
    { content: 'await', type: 'keyword' as const },
    { content: '=>', type: 'symbol' as const },
    { content: '{}', type: 'symbol' as const },
    { content: '[]', type: 'symbol' as const },
    { content: '()', type: 'symbol' as const },
    { content: '&&', type: 'symbol' as const },
    { content: '||', type: 'symbol' as const },
    { content: '"React"', type: 'string' as const },
    { content: '"TypeScript"', type: 'string' as const },
    { content: '"Supabase"', type: 'string' as const },
    { content: '// TODO', type: 'comment' as const },
    { content: '/* API */', type: 'comment' as const },
    { content: '// PULSE', type: 'comment' as const },
  ];

  // Generate neurons for neural network
  useEffect(() => {
    const generateNeurons = () => {
      const newNeurons: NeuronNode[] = [];
      const cols = 8;
      const rows = 6;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const id = `neuron-${i}-${j}`;
          const x = (i / (cols - 1)) * 100;
          const y = (j / (rows - 1)) * 100;
          
          // Create connections to nearby neurons
          const connections: string[] = [];
          if (i < cols - 1) connections.push(`neuron-${i + 1}-${j}`);
          if (j < rows - 1) connections.push(`neuron-${i}-${j + 1}`);
          if (i < cols - 1 && j < rows - 1) connections.push(`neuron-${i + 1}-${j + 1}`);
          
          newNeurons.push({
            id,
            x,
            y,
            active: false,
            connections,
          });
        }
      }
      
      setNeurons(newNeurons);
    };

    generateNeurons();
  }, []);

  // Generate stream items
  useEffect(() => {
    const generateStreamItems = () => {
      const items: StreamItem[] = [];
      const streams = 4;
      const itemsPerStream = 15;
      
      for (let stream = 0; stream < streams; stream++) {
        for (let i = 0; i < itemsPerStream; i++) {
          const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
          items.push({
            id: `${stream}-${i}`,
            content: snippet.content,
            type: snippet.type,
            top: (i / itemsPerStream) * 120 - 20, // Distribute vertically
            delay: Math.random() * 4, // Random delay
          });
        }
      }
      
      setStreamItems(items);
    };

    generateStreamItems();
    
    // Regenerate items periodically
    const interval = setInterval(generateStreamItems, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll-based neural activation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = scrollY / (document.body.scrollHeight - windowHeight);
      
      // Activate neurons based on scroll position
      setNeurons(prev => prev.map(neuron => ({
        ...neuron,
        active: Math.random() < scrollProgress * 0.3 + 0.1,
      })));
      
      // Create neural highlights at random positions
      if (Math.random() < 0.1) {
        createNeuralHighlight();
      }
    };

    const createNeuralHighlight = () => {
      if (!containerRef.current) return;
      
      const highlight = document.createElement('div');
      highlight.className = 'wf-neural-highlight';
      highlight.style.left = Math.random() * 100 + '%';
      highlight.style.top = Math.random() * 100 + '%';
      
      containerRef.current.appendChild(highlight);
      
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
        }
      }, 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="wf-data-streams">
      {/* Code Streams */}
      {[1, 2, 3, 4].map(streamIndex => (
        <div key={streamIndex} className={`wf-code-stream wf-code-stream-${streamIndex}`}>
          {streamItems
            .filter((_, index) => index % 4 === streamIndex - 1)
            .map(item => (
              <div
                key={item.id}
                className={`wf-stream-item ${item.type}`}
                style={{
                  top: `${item.top}%`,
                  animationDelay: `${item.delay}s`,
                }}
              >
                {item.content}
              </div>
            ))}
          
          {/* Stream particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`particle-${streamIndex}-${i}`}
              className="wf-stream-particle"
              style={{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's',
              }}
            />
          ))}
        </div>
      ))}

      {/* Neural Network */}
      <div className="wf-neural-network">
        <svg className="wf-neural-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Connection lines */}
          {neurons.map(neuron =>
            neuron.connections.map(connectionId => {
              const targetNeuron = neurons.find(n => n.id === connectionId);
              if (!targetNeuron) return null;
              
              return (
                <line
                  key={`${neuron.id}-${connectionId}`}
                  x1={neuron.x}
                  y1={neuron.y}
                  x2={targetNeuron.x}
                  y2={targetNeuron.y}
                  stroke={neuron.active && targetNeuron.active ? 'var(--connection-active)' : 'var(--connection-line)'}
                  strokeWidth="0.1"
                  opacity={neuron.active && targetNeuron.active ? 1 : 0.3}
                />
              );
            })
          )}
          
          {/* Neuron nodes */}
          {neurons.map(neuron => (
            <circle
              key={neuron.id}
              cx={neuron.x}
              cy={neuron.y}
              r="0.3"
              fill={neuron.active ? 'var(--neuron-active)' : 'var(--neuron-inactive)'}
              className={neuron.active ? 'active' : ''}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}