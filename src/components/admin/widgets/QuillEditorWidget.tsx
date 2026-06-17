'use client';

import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '260px', background: '#f8fafc', borderRadius: '0 0 10px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
      Memuat editor...
    </div>
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
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'blockquote'],
      ['clean'],
    ],
  }), []);

  return (
    <div className="qew-wrap">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />

      <style>{`
        /* ── Container ── */
        .qew-wrap {
          border: 1px solid var(--dash-border-2);
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
          color-scheme: light;
        }

        /* ══════════════════════════════════════════
           UNDO global * { padding:0; margin:0 }
           untuk semua elemen di dalam editor
        ══════════════════════════════════════════ */

        /* Toolbar wrapper */
        .qew-wrap .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          padding: 8px 10px !important;
          font-family: inherit;
          line-height: 1 !important;
          display: flex !important;
          flex-wrap: wrap;
          gap: 2px;
        }

        /* Container editor */
        .qew-wrap .ql-container.ql-snow {
          border: none !important;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
        }

        /* Editor area */
        .qew-wrap .ql-editor {
          min-height: ${minHeight}px;
          padding: 14px 16px !important;
          line-height: 1.75 !important;
          color: #1e293b !important;
          font-size: 0.9rem !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        /* Placeholder */
        .qew-wrap .ql-editor.ql-blank::before {
          font-style: normal !important;
          color: #94a3b8 !important;
          font-size: 0.9rem;
        }

        /* ── Toolbar buttons — restore padding stripped by * reset ── */
        .qew-wrap .ql-toolbar button {
          width: 28px !important;
          height: 28px !important;
          padding: 3px !important;
          border-radius: 5px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          transition: background 0.12s !important;
          color: #475569 !important;
        }

        .qew-wrap .ql-toolbar button:hover,
        .qew-wrap .ql-toolbar button.ql-active {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }

        /* SVG icons inside toolbar */
        .qew-wrap .ql-toolbar button svg {
          width: 16px !important;
          height: 16px !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          float: none !important;
        }

        .qew-wrap .ql-toolbar .ql-stroke {
          stroke: #64748b !important;
        }
        .qew-wrap .ql-toolbar button:hover .ql-stroke,
        .qew-wrap .ql-toolbar button.ql-active .ql-stroke {
          stroke: #059669 !important;
        }
        .qew-wrap .ql-toolbar .ql-fill {
          fill: #64748b !important;
        }
        .qew-wrap .ql-toolbar button:hover .ql-fill,
        .qew-wrap .ql-toolbar button.ql-active .ql-fill {
          fill: #059669 !important;
        }

        /* ── Format groups ── */
        .qew-wrap .ql-formats {
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 1px !important;
          padding: 0 !important;
        }

        /* ── Picker dropdowns (header, color, align) ── */
        .qew-wrap .ql-toolbar .ql-picker {
          font-size: 0.8rem !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          color: #475569 !important;
          height: 28px !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-label {
          padding: 3px 6px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 5px !important;
          display: flex !important;
          align-items: center !important;
          cursor: pointer !important;
          background: white !important;
          line-height: 1 !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-label:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-label svg {
          margin: 0 !important;
          padding: 0 !important;
          width: 14px !important;
          height: 14px !important;
          float: none !important;
          display: inline !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-options {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
          padding: 4px !important;
          z-index: 9999 !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-item {
          padding: 4px 8px !important;
          border-radius: 5px !important;
          cursor: pointer !important;
        }

        .qew-wrap .ql-toolbar .ql-picker-item:hover,
        .qew-wrap .ql-toolbar .ql-picker-item.ql-selected {
          background: #f0fdf4 !important;
          color: #059669 !important;
        }

        /* ── Content typography ── */
        .qew-wrap .ql-editor h1 { font-size: 1.6rem !important; font-weight: 800 !important; margin: 1rem 0 0.5rem !important; }
        .qew-wrap .ql-editor h2 { font-size: 1.3rem !important; font-weight: 700 !important; margin: 0.85rem 0 0.4rem !important; }
        .qew-wrap .ql-editor h3 { font-size: 1.1rem !important; font-weight: 700 !important; margin: 0.75rem 0 0.35rem !important; }
        .qew-wrap .ql-editor p  { margin: 0 0 0.6rem !important; }
        .qew-wrap .ql-editor ul,
        .qew-wrap .ql-editor ol  { padding-left: 1.5rem !important; margin: 0 0 0.6rem !important; }
        .qew-wrap .ql-editor li  { margin-bottom: 0.25rem !important; }
        .qew-wrap .ql-editor blockquote {
          border-left: 4px solid #059669 !important;
          padding-left: 1rem !important;
          color: #64748b !important;
          font-style: italic !important;
          margin: 0.75rem 0 !important;
        }
        .qew-wrap .ql-editor a { color: #059669 !important; text-decoration: underline !important; }
      `}</style>
    </div>
  );
}
