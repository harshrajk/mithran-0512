"use client";

import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { Search, ChevronDown, X } from "lucide-react";

interface SearchSelectProps {
  options: { value: string; label: string }[];
  placeholder?: string;
  onValueChange: (value: string) => void;
}

export function SearchSelect({
  options,
  placeholder = "Select...",
  onValueChange,
}: SearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const setSelectOpen = (isOpen: boolean) => {  
    setOpen(isOpen);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Select open={open} onOpenChange={setSelectOpen} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
        {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
      </SelectTrigger>
      <SelectContent className="p-0">
        <div className="relative p-2 border-b">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={inputRef}
            autoFocus
          />
          {searchTerm && (
            <X
              className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}