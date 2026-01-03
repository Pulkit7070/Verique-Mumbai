'use client';

import { ExternalLink } from 'lucide-react';
import { getDomainFromUrl } from '@/lib/utils';
import { Source } from '@/lib/types';

interface SourceComparisonProps {
  supporting: Source[];
  contradicting: Source[];
}

export function SourceComparison({ 
  supporting, 
  contradicting 
}: SourceComparisonProps) {
  if (supporting.length === 0 && contradicting.length === 0) {
    return null;
  }

  const hasConflict = supporting.length > 0 && contradicting.length > 0;

  return (
    <div className="mt-4 space-y-3">
      {hasConflict && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-yellow-900 text-sm">Sources Disagree</div>
              <div className="text-xs text-yellow-700 mt-1">
                We found evidence both supporting and contradicting this claim.
                This is normal for complex or evolving topics.
              </div>
            </div>
          </div>
        </div>
      )}

      {supporting.length > 0 && (
        <SourceList 
          title="Supporting Evidence" 
          sources={supporting} 
          color="green" 
        />
      )}

      {contradicting.length > 0 && (
        <SourceList 
          title="Contradicting Evidence" 
          sources={contradicting} 
          color="red" 
        />
      )}
    </div>
  );
}

function SourceList({ title, sources, color }: {
  title: string;
  sources: Source[];
  color: 'green' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900'
  };

  return (
    <div className={`p-3 border rounded-lg ${colorClasses[color]}`}>
      <div className="font-semibold text-sm mb-2 flex items-center gap-1">
        <span>{color === 'green' ? '✓' : '✗'}</span> {title}
      </div>
      <ul className="space-y-2">
        {sources.map((source, i) => (
          <li key={i}>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:bg-white/50 p-2 rounded transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium hover:underline">
                    {getDomainFromUrl(source.url)}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                {source.domain_score && (
                  <span className="text-xs opacity-75">
                    Trust: {Math.round(source.domain_score * 100)}%
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 line-clamp-2">
                {source.snippet}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
