'use client';

// CSS import WAJIB di top-level (bukan di dalam dynamic/async)
import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '260px', background: '#f9fafb', borderRadius: '0 0 10px 10px', animation: 'qew-pulse 1.5s ease-in-out infinite' }} />
  ),
});

type Props = {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function QuillEditorWidget({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  minHeight = 260,
}: Props) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  }), []);

  return (
    <div className="qew-root">
      <div className="qew-label">Editor Teks</div>
      {/* Light-mode isolation — Quill snow CSS is designed for white background */}
      <div className="qew-quill-host">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
        />
      </div>
      <style>{`
        @keyframes qew-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }

        .qew-root {
          border: 1px solid var(--dash-border);
          border-radius: 10px;
          overflow: hidden;
        }

        .qew-label {
          background: var(--dash-surface-hover);
          border-bottom: 1px solid var(--dash-border);
          padding: 0.4rem 0.9rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--dash-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Force light context so Quill snow CSS renders correctly */
        .qew-quill-host {
          background: #ffffff;
          color: #1a1a1a;
          color-scheme: light;
        }

        /* ── Editor min-height ── */
        .qew-quill-host .ql-editor {
          min-height: ${minHeight}px;
          font-size: 0.9rem;
          line-height: 1.75;
        }

        /* ── Placeholder ── */
        .qew-quill-host .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
