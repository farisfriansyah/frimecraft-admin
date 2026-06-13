// src/components/admin/portfolios/RichTextEditor.tsx
"use client";

import dynamic from "next/dynamic";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";
import { Button } from "@/src/app/ui/button";

// Lazy load Tiptap biar tidak SSR
const TiptapEditor = dynamic(
  () => import("@tiptap/react").then((mod) => {
    const { useEditor, EditorContent } = mod;
    return function TiptapEditorComponent({ value, onChange }: { value: string; onChange: (value: string) => void }) {
      const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        immediatelyRender: false, // INI YANG PENTING!
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
          attributes: {
            class:
              "prose prose-sm dark:prose-invert max-w-none min-h-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          },
        },
      });

      if (!editor) return <div className="min-h-48 border rounded-md animate-pulse bg-muted/20" />;

      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-1 border-b p-2 bg-muted/50">
            <Button size="icon" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
          <EditorContent editor={editor} className="p-4 prose prose-sm max-w-none" />
        </div>
      );
    };
  }),
  {
    ssr: false, // JANGAN RENDER DI SERVER!
    loading: () => (
      <div className="min-h-48 border rounded-lg flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    ),
  }
);

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TiptapEditor value={value} onChange={onChange} />;
}