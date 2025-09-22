import React, { useState, useCallback } from 'react';
import { formatMarkdown } from './services/geminiService';
import { useHistory } from './hooks/useHistory';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { CopyIcon, CheckIcon, BrandIcon, ClearIcon, UndoIcon, RedoIcon } from './components/Icons';

const initialMarkdown = ``;

function App() {
  const { 
    state: inputText, 
    setState: setInputText, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialMarkdown);
  
  const [formattedText, setFormattedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFormattedText('');
    setIsCopied(false);
    try {
      const result = await formatMarkdown(inputText);
      setFormattedText(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleCopy = useCallback(() => {
    if (formattedText) {
      navigator.clipboard.writeText(formattedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [formattedText]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the input and output? This action cannot be undone.')) {
      setInputText('');
      setFormattedText('');
      setError(null);
      setIsCopied(false);
    }
  }, [setInputText]);

  return (
    <div className="min-h-screen bg-transparent text-gray-200 font-sans flex flex-col">
      <header className="p-4 bg-gray-800/60 backdrop-blur-md border-b border-gray-700/50 shadow-2xl sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-center">
            <BrandIcon />
            <h1 className="text-2xl font-bold ml-3 tracking-wide">AI Markdown Formatter</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        {/* Input Panel */}
        <div className="flex flex-col space-y-4">
          <label htmlFor="input-markdown" className="text-lg font-semibold text-gray-400 tracking-wider">
            Your Markdown
          </label>
          <textarea
            id="input-markdown"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-grow bg-gray-800/50 shadow-inner border border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-teal-500 transition-all duration-300 resize-none placeholder-gray-500"
            placeholder="Paste your messy Markdown here and let the AI clean it up..."
            rows={15}
          />
          <div className="flex items-stretch space-x-2">
            <button
              onClick={handleFormat}
              disabled={isLoading || !inputText.trim()}
              className="flex-grow bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/40 hover:scale-105 active:scale-95"
            >
              {isLoading ? <Loader /> : 'Format Markdown'}
            </button>
            <button
              onClick={undo}
              disabled={!canUndo || isLoading}
              title="Undo"
              aria-label="Undo last change"
              className="flex-shrink-0 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
                <UndoIcon />
            </button>
             <button
              onClick={redo}
              disabled={!canRedo || isLoading}
              title="Redo"
              aria-label="Redo last change"
              className="flex-shrink-0 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
                <RedoIcon />
            </button>
            <button
              onClick={handleClear}
              disabled={(!inputText.trim() && !formattedText.trim()) || isLoading}
              title="Clear input and output"
              aria-label="Clear text areas"
              className="flex-shrink-0 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <ClearIcon />
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-4">
          <label htmlFor="output-markdown" className="text-lg font-semibold text-gray-400 tracking-wider">
            Formatted Output
          </label>
          <div className="relative w-full flex-grow backdrop-blur-sm bg-gray-800/50 border border-gray-700 rounded-xl p-4 overflow-auto">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl">
                <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-gray-400">Formatting in progress...</p>
                </div>
              </div>
            )}
            {error && <ErrorDisplay message={error} />}
            {!isLoading && !error && formattedText && (
              <div className="animate-fade-in">
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
                  title="Copy to clipboard"
                  aria-label="Copy formatted text"
                >
                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                </button>
                <pre className="whitespace-pre-wrap text-gray-300">
                  <code className="font-mono text-sm">{formattedText}</code>
                </pre>
              </div>
            )}
            {!isLoading && !error && !formattedText && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Your formatted Markdown will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-gray-600 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
}

export default App;