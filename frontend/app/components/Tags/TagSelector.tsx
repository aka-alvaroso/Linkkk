"use client";
import React, { useState, useRef, useEffect } from "react";
import { TbChevronDown, TbPlus } from "react-icons/tb";
import type { Tag } from "@/app/types";
import TagChip from "./TagChip";
import { cn } from "@/app/utils/cn";

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  maxTags?: number | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function TagSelector({ tags, selectedTagIds, onChange, maxTags = null, placeholder = "Add tags…", disabled = false, className }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));
  const availableTags = tags.filter((t) => !selectedTagIds.includes(t.id));
  const atLimit = maxTags !== null && selectedTagIds.length >= maxTags;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else if (!atLimit) {
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "w-full flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-2xl border border-dark/15 bg-dark/5 text-left transition-colors",
          !disabled && "hover:border-dark/30 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          open && "border-dark/40"
        )}
      >
        {selectedTags.length === 0 ? (
          <span className="text-dark/40 text-sm flex-1">{placeholder}</span>
        ) : (
          selectedTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              size="xs"
              onRemove={() => toggle(tag.id)}
            />
          ))
        )}
        <TbChevronDown size={16} className={cn("ml-auto text-dark/40 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-light border border-dark/15 rounded-2xl shadow-lg overflow-hidden">
          {availableTags.length === 0 && !atLimit ? (
            <p className="px-3 py-2 text-sm text-dark/40">No more tags available</p>
          ) : atLimit ? (
            <p className="px-3 py-2 text-sm text-dark/40">Tag limit reached ({maxTags})</p>
          ) : null}
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-dark/5 transition-colors text-left"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color ?? "#6b7280" }} />
              {tag.name}
              <TbPlus size={14} className="ml-auto text-dark/30" />
            </button>
          ))}
          {selectedTags.length > 0 && (
            <div className="border-t border-dark/10 px-3 py-1.5">
              <p className="text-xs text-dark/40">{selectedTags.length} selected{maxTags !== null ? ` / ${maxTags} max` : ""}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
