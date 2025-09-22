import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  markdownText: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdownText }) => {
  if (!markdownText) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        <p>The rendered preview of your formatted Markdown will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-gray-300">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold border-b border-gray-600 pb-2 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                a: ({node, ...props}) => <a className="text-teal-400 hover:underline" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-2" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4" {...props} />,
                // FIX: Explicitly type the props for the code component to resolve a TypeScript error
                // where the custom `inline` prop from react-markdown was not correctly inferred.
                code: ({node, inline, className, children, ...props}: React.ComponentPropsWithoutRef<'code'> & { node?: unknown; inline?: boolean }) => {
                    return !inline ? (
                      <pre className="bg-gray-900/70 p-4 rounded-lg my-4 overflow-x-auto">
                        <code className={`font-mono text-sm ${className || ''}`} {...props}>{children}</code>
                      </pre>
                    ) : (
                      <code className="bg-gray-700 rounded px-1.5 py-1 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    )
                },
                table: ({node, ...props}) => <div className="overflow-x-auto"><table className="table-auto w-full my-4 border-collapse border border-gray-600" {...props} /></div>,
                thead: ({node, ...props}) => <thead className="bg-gray-700" {...props} />,
                th: ({node, ...props}) => <th className="border border-gray-600 px-4 py-2 text-left" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-600 px-4 py-2" {...props} />,
                hr: ({node, ...props}) => <hr className="border-gray-700 my-6" {...props} />
            }}
        >
            {markdownText}
        </ReactMarkdown>
    </div>
  );
};