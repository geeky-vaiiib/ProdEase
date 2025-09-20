'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2, Calendar, Hash, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string | number) => Promise<void>;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  validation?: (value: string | number) => string | null;
}

export function EditableField({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder,
  className,
  disabled = false,
  icon,
  label,
  validation
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isLoading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (type === 'textarea') {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (validation) {
      const validationError = validation(type === 'number' ? Number(editValue) : editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError(null);
    
    try {
      const finalValue = type === 'number' ? Number(editValue) : editValue;
      await onSave(finalValue);
      setIsEditing(false);
      setJustSaved(true);
      // Clear the "just saved" indicator after 2 seconds
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'number':
        return <Hash className="h-3 w-3" />;
      default:
        return <Edit2 className="h-3 w-3" />;
    }
  };

  if (disabled) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-muted-foreground">{value}</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex items-center gap-2">
          {type === 'select' ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === 'textarea' ? (
            <Textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[60px] resize-none"
              rows={2}
            />
          ) : (
            <Input
              ref={inputRef}
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-8"
            />
          )}
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-all duration-200",
      justSaved && "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800",
      className
    )}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className={cn(
        "flex-1 transition-colors",
        justSaved && "text-green-700 dark:text-green-300"
      )}>
        {value}
      </span>
      {justSaved && (
        <span className="text-xs text-green-600 dark:text-green-400 animate-pulse">
          ✓ Saved
        </span>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {getIcon()}
      </Button>
    </div>
  );
}
