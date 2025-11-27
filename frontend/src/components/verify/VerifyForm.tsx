'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Send, Link as LinkIcon } from 'lucide-react';
import { verifyContent } from '@/lib/api';
import { VerificationResult, Vertical } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VerifyFormProps {
  onResult: (result: VerificationResult, originalText: string) => void;
}

const VERTICALS: { value: Vertical; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'saas', label: 'SaaS / Tech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'professional', label: 'Professional' },
];

const SAMPLE_TEXT = `Our AI-powered platform is used by over 10,000 teams worldwide and reduces operational costs by 50%. 

Founded in 2019, we've processed more than 1 billion requests and maintain 99.99% uptime. 

Our technology is based on the latest GPT-4 models and can understand 50+ languages. Independent studies show that our product increases productivity by 3x compared to traditional methods.`;

export function VerifyForm({ onResult }: VerifyFormProps) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [vertical, setVertical] = useState<Vertical>('general');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const mutation = useMutation({
    mutationFn: verifyContent,
    onSuccess: (result) => {
      onResult(result, text);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    mutation.mutate({
      text: text.trim(),
      url: url.trim() || undefined,
      vertical,
    });
  };

  const handleSampleClick = () => {
    setText(SAMPLE_TEXT);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-slate-700">
            Content to Verify
          </label>
          <button
            type="button"
            onClick={handleSampleClick}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Try sample text
          </button>
        </div>
        <textarea
          id="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any text content here - product descriptions, blog posts, articles, LinkedIn posts..."
          className={cn(
            "w-full h-64 px-4 py-3 rounded-xl border border-slate-300",
            "focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "placeholder:text-slate-400 resize-none",
            "transition-all duration-200"
          )}
          disabled={mutation.isPending}
        />
        <div className="mt-1 flex justify-between text-sm text-slate-500">
          <span>{text.length.toLocaleString()} characters</span>
          <span>{text.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* URL input (optional) */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <LinkIcon className="h-4 w-4" />
          {showUrlInput ? 'Hide source URL' : 'Add source URL (optional)'}
        </button>
        
        {showUrlInput && (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className={cn(
              "mt-2 w-full px-4 py-2 rounded-lg border border-slate-300",
              "focus:ring-2 focus:ring-green-500 focus:border-transparent"
            )}
          />
        )}
      </div>

      {/* Vertical selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Content Category
        </label>
        <div className="flex flex-wrap gap-2">
          {VERTICALS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVertical(v.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                vertical === v.value
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {mutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Verification failed</p>
          <p className="text-sm mt-1">
            {mutation.error instanceof Error 
              ? mutation.error.message 
              : 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!text.trim() || mutation.isPending}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl",
          "text-lg font-semibold transition-all duration-200",
          text.trim() && !mutation.isPending
            ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        )}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing claims... (this may take 15-30 seconds)
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Verify Content
          </>
        )}
      </button>
    </form>
  );
}
