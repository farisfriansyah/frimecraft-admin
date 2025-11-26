// src/components/ui/tags-input.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Tag = string;

type TagsInputProps = {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
};

export function TagsInput({ value, onChange, placeholder = "Tambah tag..." }: TagsInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleAdd = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue("");
  };

  const handleRemove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAdd(inputValue.trim());
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 min-h-10">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(tag)}
            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Command className="border-none bg-transparent shadow-none">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 outline-none border-none bg-transparent placeholder:text-muted-foreground"
        />
        {open && inputValue && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
            <CommandEmpty>Tekan Enter untuk tambah "{inputValue}"</CommandEmpty>
          </div>
        )}
      </Command>
    </div>
  );
}