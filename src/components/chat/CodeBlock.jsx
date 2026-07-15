import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download } from 'lucide-react';

function downloadCode(code, language) {
  const ext = {
    javascript: 'js', jsx: 'jsx', typescript: 'ts', tsx: 'tsx',
    python: 'py', html: 'html', css: 'css', json: 'json',
    bash: 'sh', shell: 'sh', sql: 'sql', markdown: 'md',
  };
  const extension = ext[language?.toLowerCase()] || 'txt';
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CodeBlock({ code, language = 'text', inline = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  if (inline) {
    return (
      <code className="bg-white/10 text-accent px-1.5 py-0.5 rounded-md text-[0.85em] font-mono">
        {code}
      </code>
    );
  }

  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '0.8125rem',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
    },
  };

  return (
    <div className="group rounded-xl overflow-hidden border border-white/10 bg-[#0D0D12] my-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-mono text-muted">
          {language || 'code'}
        </span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => downloadCode(code, language)}
            title="Download code"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download size={12} />
            <span>Download</span>
          </button>
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy code'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      {/* Code content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={customStyle}
          PreTag="div"
          wrapLongLines={false}
          customStyle={{ background: 'transparent' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
