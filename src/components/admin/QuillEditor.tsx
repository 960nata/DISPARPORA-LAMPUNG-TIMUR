"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const QuillEditorInner = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  { ssr: false, loading: () => <div style={{ height: "200px", backgroundColor: "var(--dash-surface-hover)", borderRadius: "0 0 8px 8px" }} /> }
);

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

export default function QuillEditor({ value, onChange, placeholder = "Tulis konten...", minHeight = 220 }: Props) {
  return (
    <div className="quill-wrapper">
      <QuillEditorInner
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{ toolbar: TOOLBAR }}
        style={{ fontFamily: "var(--font-main)" }}
      />
      <style>{`
        .quill-wrapper .ql-toolbar {
          background: var(--dash-surface-hover);
          border: 1px solid var(--dash-border-2) !important;
          border-bottom: none !important;
          border-radius: 10px 10px 0 0;
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .quill-wrapper .ql-toolbar button,
        .quill-wrapper .ql-toolbar .ql-picker-label {
          color: var(--dash-text-soft);
          border-radius: 6px;
          padding: 4px 6px;
          transition: all 0.15s;
        }
        .quill-wrapper .ql-toolbar button:hover,
        .quill-wrapper .ql-toolbar button.ql-active,
        .quill-wrapper .ql-toolbar .ql-picker-label:hover {
          color: var(--dash-primary);
          background: var(--dash-primary-bg);
        }
        .quill-wrapper .ql-toolbar .ql-stroke { stroke: currentColor; }
        .quill-wrapper .ql-toolbar .ql-fill { fill: currentColor; }
        .quill-wrapper .ql-toolbar .ql-picker-options {
          background: var(--dash-card);
          border: 1px solid var(--dash-border);
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .quill-wrapper .ql-container {
          border: 1px solid var(--dash-border-2) !important;
          border-radius: 0 0 10px 10px;
          background: var(--dash-card);
          font-family: var(--font-main);
          font-size: 0.92rem;
          min-height: ${minHeight}px;
        }
        .quill-wrapper .ql-editor {
          min-height: ${minHeight}px;
          color: var(--dash-text);
          line-height: 1.75;
          padding: 14px 16px;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: var(--dash-text-muted);
          font-style: normal;
          font-size: 0.9rem;
        }
        .quill-wrapper .ql-editor p { margin: 0 0 0.5rem; }
        .quill-wrapper .ql-editor h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--dash-text); }
        .quill-wrapper .ql-editor h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--dash-text); }
        .quill-wrapper .ql-editor h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--dash-text); }
        .quill-wrapper .ql-editor ul,
        .quill-wrapper .ql-editor ol { padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .quill-wrapper .ql-editor a { color: var(--dash-primary); text-decoration: underline; }
        .quill-wrapper .ql-editor blockquote {
          border-left: 3px solid var(--dash-primary);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: var(--dash-text-soft);
          font-style: italic;
        }
        .quill-wrapper .ql-editor pre {
          background: var(--dash-surface-hover);
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--dash-text);
        }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before { content: "Heading 1"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: "Heading 2"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: "Heading 3"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item::before { content: "Normal"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before { content: "Heading 1"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: "Heading 2"; }
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: "Heading 3"; }
      `}</style>
    </div>
  );
}
