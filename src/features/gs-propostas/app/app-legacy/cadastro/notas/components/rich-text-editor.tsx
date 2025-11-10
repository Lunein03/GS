'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Bold, Italic, Link, List, ListOrdered, Underline } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn, sanitizeHtml } from '@/shared/lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Digite aqui...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const sanitizedValue = useMemo(() => sanitizeHtml(value), [value]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const current = sanitizeHtml(editorRef.current.innerHTML);
    if (current !== sanitizedValue) {
      editorRef.current.innerHTML = sanitizedValue;
    }
  }, [sanitizedValue]);

  const applyCommand = (command: string, valueArg?: string) => {
    if (disabled) {
      return;
    }

    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      const htmlOutput = sanitizeHtml(editorRef.current.innerHTML);
      onChange(htmlOutput);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) {
      return;
    }

    const htmlOutput = sanitizeHtml(editorRef.current.innerHTML);
    onChange(htmlOutput);
  };

  const handleCreateLink = () => {
    const url = window.prompt('Informe a URL do link');
    if (!url) {
      return;
    }

    applyCommand('createLink', url);
  };

  const isEmpty = sanitizedValue.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-md border bg-muted/50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('bold')}
          disabled={disabled}
          aria-label="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('italic')}
          disabled={disabled}
          aria-label="Italico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('underline')}
          disabled={disabled}
          aria-label="Sublinhar"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('insertUnorderedList')}
          disabled={disabled}
          aria-label="Lista nao ordenada"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('insertOrderedList')}
          disabled={disabled}
          aria-label="Lista ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCreateLink}
          disabled={disabled}
          aria-label="Inserir link"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          className={cn(
            'min-h-[240px] rounded-md border bg-amber-50 p-4 text-sm focus:outline-none',
            disabled && 'pointer-events-none opacity-60',
          )}
          contentEditable={!disabled}
          onInput={handleInput}
          role="textbox"
          aria-multiline="true"
          aria-disabled={disabled}
          aria-label="Editor de texto"
          suppressContentEditableWarning
        />

        {isEmpty && !disabled && (
          <span className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}


