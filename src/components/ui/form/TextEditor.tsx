"use client";

import dynamic from "next/dynamic";

type TextEditorProps = {
    value?: string;
    onChange: (content: string) => void;
};

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
    ssr: false,
    loading: () => (
        <div className="rounded-lg border border-stroke bg-white p-4" style={{ minHeight: "200px" }}>
            <div className="mb-2 h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-32 animate-pulse rounded bg-gray-50" />
        </div>
    ),
});

export default function TextEditor({ value, onChange }: TextEditorProps) {
    return <RichTextEditor value={value} onChange={onChange} />;
}
