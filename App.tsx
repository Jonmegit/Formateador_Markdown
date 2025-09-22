import React, { useState, useCallback, useRef } from 'react';
import { formatMarkdownStream } from './services/geminiService';
import { usePersistentState } from './hooks/usePersistentState';
import { Loader } from './components/Loader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { MarkdownPreview } from './components/MarkdownPreview';
import { CopyIcon, CheckIcon, BrandIcon, ClearIcon, UndoIcon, RedoIcon, UploadIcon, DownloadIcon, WandIcon } from './components/Icons';
import { Editor, EditorRef } from './components/Editor';

function App() {
  const [inputText, setInputText] = usePersistentState<string>('inputText', '');
  const [formattedText, setFormattedText] = usePersistentState<string>('formattedText', '');
  const [customInstruction, setCustomInstruction] = usePersistentState<string>('customInstruction', '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [outputView, setOutputView] = usePersistentState<'preview' | 'formatted'>('outputView', 'preview');
  const [editorKey, setEditorKey] = useState(Date.now());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorRef>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFormattedText('');
    setIsCopied(false);
    setOutputView('formatted');

    try {
      const stream = formatMarkdownStream(inputText, customInstruction);
      for await (const chunk of stream) {
        setFormattedText((prev) => prev + chunk);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, customInstruction, setFormattedText, setOutputView]);

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
      setCustomInstruction('');
      setError(null);
      setIsCopied(false);
      setOutputView('preview');
      setEditorKey(Date.now()); // Force remount of the editor
    }
  }, [setInputText, setFormattedText, setCustomInstruction, setOutputView]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
        setOutputView('preview');
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };
  
  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <div className="w-full flex-grow bg-gray-800/50 shadow-inner border border-gray-700 rounded-xl p-0.5 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:border-teal-500 transition-all duration-300 overflow-hidden">
            <Editor
              key={editorKey}
              ref={editorRef}
              value={inputText}
              onChange={setInputText}
              onHistoryChange={({ canUndo, canRedo }) => {
                setCanUndo(canUndo);
                setCanRedo(canRedo);
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="custom-instruction" className="text-sm font-semibold text-gray-400 tracking-wider flex items-center gap-2">
              <WandIcon />
              Custom Instructions (Optional)
            </label>
            <input
              id="custom-instruction"
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-800/50 shadow-inner border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 placeholder-gray-500 disabled:opacity-50"
              placeholder="e.g., 'Translate to Spanish' or 'Make the tone more formal'"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={handleFormat}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/40 hover:scale-105 active:scale-95"
            >
              {isLoading ? <Loader /> : 'Format Markdown'}
            </button>
            <div className="flex items-stretch space-x-2">
              <button onClick={() => editorRef.current?.undo()} disabled={!canUndo || isLoading} title="Undo" aria-label="Undo last change" className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"><UndoIcon /></button>
              <button onClick={() => editorRef.current?.redo()} disabled={!canRedo || isLoading} title="Redo" aria-label="Redo last change" className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"><RedoIcon /></button>
              <button onClick={handleUploadClick} disabled={isLoading} title="Load .md file" aria-label="Load Markdown file" className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"><UploadIcon /></button>
              <button onClick={handleClear} disabled={(!inputText.trim() && !formattedText.trim()) || isLoading} title="Clear all" aria-label="Clear text areas" className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-bold p-3 rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"><ClearIcon /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md, .markdown, .txt" className="hidden" />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center space-x-2 border-b border-gray-700/50">
                <button
                    onClick={() => setOutputView('preview')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-md ${outputView === 'preview' ? 'text-white bg-gray-800/50 border-gray-700 border-b-transparent border' : 'text-gray-400 hover:text-white'}`}
                >
                    Preview
                </button>
                <button
                    onClick={() => setOutputView('formatted')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors rounded-t-md ${outputView === 'formatted' ? 'text-white bg-gray-800/50 border-gray-700 border-b-transparent border' : 'text-gray-400 hover:text-white'}`}
                >
                    Formatted
                </button>
            </div>
            
            {outputView === 'formatted' && formattedText && !isLoading && (
              <div className="flex items-center space-x-2">
                <button onClick={handleDownload} title="Save as .md file" className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"><DownloadIcon /></button>
                <button onClick={handleCopy} title="Copy to clipboard" className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out hover:scale-110 active:scale-95">{isCopied ? <CheckIcon /> : <CopyIcon />}</button>
              </div>
            )}
          </div>
          <div className="relative w-full flex-grow backdrop-blur-sm bg-gray-800/50 border border-gray-700 rounded-xl overflow-auto">
             {outputView === 'preview' && <MarkdownPreview markdownText={formattedText} />}

             {outputView === 'formatted' && (
                <>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl z-10">
                            <div className="text-center">
                                <Loader />
                                <p className="mt-2 text-gray-400">Formatting in progress...</p>
                            </div>
                        </div>
                    )}
                    <div className="h-full">
                        {error && <div className="p-4"><ErrorDisplay message={error} /></div>}
                        {!error && formattedText && (
                            <pre className="whitespace-pre-wrap text-gray-300 p-4">
                                <code className="font-mono text-sm">{formattedText}</code>
                            </pre>
                        )}
                        {!isLoading && !error && !formattedText && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Your formatted Markdown will appear here.</p>
                            </div>
                        )}
                    </div>
                </>
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