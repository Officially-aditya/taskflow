"use client";

import { Fragment } from 'react';

// ── Inline parser ─────────────────────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, [text](url)

function parseInline(text) {
  const tokens = [];
  // Combined regex: fenced inline-code first, then bold, italic, link
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: 'text', value: text.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('`')) {
      tokens.push({ type: 'code', value: raw.slice(1, -1) });
    } else if (raw.startsWith('**')) {
      tokens.push({ type: 'bold', value: raw.slice(2, -2) });
    } else if (raw.startsWith('*')) {
      tokens.push({ type: 'italic', value: raw.slice(1, -1) });
    } else if (raw.startsWith('[')) {
      const labelEnd = raw.indexOf(']');
      const label = raw.slice(1, labelEnd);
      const url = raw.slice(labelEnd + 2, -1);
      tokens.push({ type: 'link', label, url });
    }
    last = match.index + raw.length;
  }

  if (last < text.length) {
    tokens.push({ type: 'text', value: text.slice(last) });
  }

  return tokens.map((token, i) => {
    switch (token.type) {
      case 'bold':
        return <strong key={i} className="font-semibold text-neutral-100">{token.value}</strong>;
      case 'italic':
        return <em key={i} className="italic text-neutral-300">{token.value}</em>;
      case 'code':
        return (
          <code key={i} className="font-mono text-sm bg-white/10 px-1.5 py-0.5 rounded text-emerald-300">
            {token.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={i}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100 transition-opacity text-emerald-400"
          >
            {token.label}
          </a>
        );
      default:
        return <Fragment key={i}>{token.value}</Fragment>;
    }
  });
}

// ── Block tokeniser ───────────────────────────────────────────────────────────

function tokeniseBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'codeblock', lang, value: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings
    if (/^#{1,3} /.test(line)) {
      const level = line.match(/^(#{1,3}) /)[1].length;
      blocks.push({ type: `h${level}`, value: line.replace(/^#{1,3} /, '') });
      i++;
      continue;
    }

    // Unordered list — collect consecutive list items
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list — collect consecutive list items
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Blank line — paragraph separator, skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect until blank line or block element
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,3} /.test(lines[i]) &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !lines[i].trimStart().startsWith('```')
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'p', value: paraLines.join(' ') });
    }
  }

  return blocks;
}

// ── Renderer ──────────────────────────────────────────────────────────────────

export default function MarkdownRenderer({ content }) {
  if (!content) return null;
  const blocks = tokeniseBlocks(content);

  return (
    <div className="text-neutral-200 text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={idx} className="text-lg font-semibold text-neutral-100 mt-4 mb-1 first:mt-0">
                {parseInline(block.value)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="text-base font-semibold text-neutral-100 mt-4 mb-1 first:mt-0">
                {parseInline(block.value)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="text-base font-semibold text-neutral-200 mt-4 mb-1 first:mt-0">
                {parseInline(block.value)}
              </h3>
            );
          case 'p':
            return (
              <p key={idx} className="mb-3">
                {parseInline(block.value)}
              </p>
            );
          case 'ul':
            return (
              <ul key={idx} className="list-disc pl-5 mb-3 space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{parseInline(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="list-decimal pl-5 mb-3 space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{parseInline(item)}</li>
                ))}
              </ol>
            );
          case 'codeblock':
            return (
              <pre key={idx} className="font-mono text-sm bg-black/80 text-green-300 p-4 rounded-lg overflow-x-auto my-3 whitespace-pre">
                <code>{block.value}</code>
              </pre>
            );
          case 'hr':
            return <hr key={idx} className="border-t border-white/20 my-4" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
