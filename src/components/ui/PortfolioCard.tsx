// src/components/ui/PortfolioCard.tsx
import React from "react";

export default function PortfolioCard({
  title,
  image,
  description,
  tags,
}: {
  title: string;
  image?: string;
  description?: string;
  tags?: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
      <div className="h-40 bg-slate-100 grid place-items-center overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-3">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</div>
        <div className="mt-3 text-xs text-slate-400">{tags}</div>
      </div>
    </div>
  );
}
