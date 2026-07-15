import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

export function MarkdownRenderer({ content, className = '' }) {
  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeStr = String(children).replace(/\n$/, '');

            if (inline) {
              return <CodeBlock code={codeStr} language={language} inline />;
            }
            return <CodeBlock code={codeStr} language={language} />;
          },

          // Tables with horizontal scroll wrapper
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-white/5">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2.5 text-sm text-text-secondary border-t border-white/5">
                {children}
              </td>
            );
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-white/3 transition-colors">{children}</tr>
            );
          },

          // Headings
          h1({ children }) {
            return <h1 className="text-xl font-bold text-white mt-5 mb-3 leading-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-semibold text-white mt-4 mb-2.5 leading-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-white/90 mt-3 mb-2">{children}</h3>;
          },

          // Paragraphs
          p({ children }) {
            return <p className="text-text-secondary leading-relaxed mb-3 last:mb-0">{children}</p>;
          },

          // Lists
          ul({ children }) {
            return <ul className="list-none space-y-1 mb-3 pl-0">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-none space-y-1 mb-3 pl-0 counter-reset-list">{children}</ol>;
          },
          li({ children }) {
            return (
              <li className="flex gap-2.5 text-text-secondary leading-relaxed">
                <span className="text-primary shrink-0 mt-0.5 font-medium">•</span>
                <span>{children}</span>
              </li>
            );
          },

          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-primary/50 pl-4 my-3 text-muted italic">
                {children}
              </blockquote>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className="border-white/10 my-4" />;
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-primary underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },

          // Strong / Bold
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },

          // Emphasis / Italic
          em({ children }) {
            return <em className="italic text-text-secondary">{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
