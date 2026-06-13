// src/app/admin/articles/components/ArticleRichTextEditor.tsx
"use client";

import dynamic from "next/dynamic";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Bold, Italic, List, ListOrdered, Heading2, Code2, ImagePlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/src/app/ui/button";
import { useState } from "react";

const lowlight = createLowlight(common);

const TiptapEditor = dynamic(
  () => import("@tiptap/react").then((mod) => {
    const { useEditor, EditorContent } = mod;
    return function TiptapEditorComponent({ 
      value, 
      onChange 
    }: { 
      value: string; 
      onChange: (value: string) => void 
    }) {
      const [showPreview, setShowPreview] = useState(false);

      const editor = useEditor({
        extensions: [
          StarterKit,
          Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full h-auto" } }),
          CodeBlockLowlight.configure({ lowlight }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
          attributes: {
            class:
              "prose prose-sm dark:prose-invert max-w-none min-h-96 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          },
        },
      });

      if (!editor) return <div className="min-h-96 border rounded-md animate-pulse bg-muted/20" />;

      const handleImageUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event: any) => {
            editor
              .chain()
              .focus()
              .setImage({ src: event.target.result })
              .run();
          };
          reader.readAsDataURL(file);
        };
        input.click();
      };

      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/50">
            <Button size="icon" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
              <List className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={editor.isActive("codeBlock") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block">
              <Code2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleImageUpload} title="Insert Image">
              <ImagePlus className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button size="icon" variant={showPreview ? "default" : "ghost"} onClick={() => setShowPreview(!showPreview)} title={showPreview ? "Edit Mode" : "Preview"}>
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {showPreview ? (
            <div className="p-4 prose prose-sm max-w-none min-h-96 bg-background" dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <EditorContent editor={editor} className="p-4 prose prose-sm max-w-none" />
          )}
        </div>
      );
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-96 border rounded-lg flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    ),
  }
);

export default function ArticleRichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TiptapEditor value={value} onChange={onChange} />;
}
