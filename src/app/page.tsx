'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { EnmaCho, initialEnmaCho } from '@/lib/state/enma-cho';

export default function Chat() {
  const { messages, sendMessage } = useChat({
    onError: (error) => {
      console.error('Chat Error:', error);
    },
    onFinish: (message) => {
      console.log('Chat Finished:', message);
    },
  });
  const [input, setInput] = useState('');
  const [fixedDocument, setFixedDocument] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [enmaCho, setEnmaCho] = useState<EnmaCho>(initialEnmaCho);

  // Monitor tool calls to update state
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === 'assistant' && (lastMessage as any).toolInvocations) {
      (lastMessage as any).toolInvocations.forEach((tool: any) => {
        if (tool.toolName === 'updateEnmaCho' && tool.state === 'result') {
          const delta = tool.result;
          setEnmaCho(prev => ({ ...prev, ...delta }));
        }
      });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput(''); // Clear input early

    let analystReport = null;

    // Router Logic: If input is long enough, trigger Analyst
    if (userMessage.length > 30) {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ prompt: userMessage }),
        });
        const data = await response.json();
        analystReport = data;
        setFixedDocument(data.fixed_document_markdown);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Send message to Chat API with state
    try {
      await sendMessage({
        role: 'user',
        content: userMessage,
      } as any, {
        body: {
          analystReport,
          enmaCho
        }
      } as any);
    } catch (error) {
      console.error('sendMessage failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Panel: Chat */}
      <div className="w-1/2 flex flex-col border-r border-gray-300 dark:border-gray-700 relative">
        {/* Debug Panel */}
        <div className="absolute top-0 right-0 p-2 m-2 bg-black/80 text-white text-xs rounded z-10 pointer-events-none">
          <div>Patience: {enmaCho.patienceTokens}</div>
          <div>Anger: {enmaCho.angerLevel}%</div>
          <div>Active Q: {enmaCho.activeInterrogation || 'None'}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-12">
          {messages.map(m => (
            <div key={m.id} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-blue-100 dark:bg-blue-900 ml-auto max-w-[80%]' : 'bg-white dark:bg-gray-800 mr-auto max-w-[80%]'}`}>
              <div className="font-bold text-xs mb-1 opacity-50">{m.role === 'user' ? 'YOU' : 'GAOO'}</div>
              <div className="whitespace-pre-wrap">
                {(m as any).content
                  ? (m as any).content
                  : (m as any).parts
                    ? (m as any).parts.map((p: any, i: number) => p.type === 'text' ? p.text : '').join('')
                    : ''}
              </div>
            </div>
          ))}
          {isAnalyzing && (
            <div className="text-center text-sm text-gray-500 animate-pulse">
              Gaoo is reading your trash...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
          <input
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            placeholder="Say something... (Over 30 chars triggers analysis)"
            onChange={handleInputChange}
            disabled={isAnalyzing}
          />
        </form>
      </div>

      {/* Right Panel: Artifact (The Fix) */}
      <div className="w-1/2 p-8 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">The Fix (Artifact)</h2>
        {fixedDocument ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <pre className="whitespace-pre-wrap font-mono text-sm">{fixedDocument}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(fixedDocument)}
              className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            No fixed document yet.
          </div>
        )}
      </div>
    </div>
  );
}
