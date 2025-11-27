'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { VerifyForm } from '@/components/verify/VerifyForm';
import { ResultsView } from '@/components/verify/ResultsView';
import { VerificationResult } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [originalText, setOriginalText] = useState<string>('');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!result ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Verify Any Content with AI
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Paste any text and get instant, evidence-based verification of factual claims.
                See what&apos;s supported, what&apos;s questionable, and why.
              </p>
            </div>
            
            <VerifyForm 
              onResult={(res, text) => {
                setResult(res);
                setOriginalText(text);
              }} 
            />
            
            {/* Features section */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔍"
                title="Claim Extraction"
                description="AI automatically identifies factual claims in your content"
              />
              <FeatureCard
                icon="🌐"
                title="Evidence Retrieval"
                description="Fetches supporting and contradicting evidence from the web"
              />
              <FeatureCard
                icon="✅"
                title="Transparent Verdicts"
                description="See exactly why each claim is rated, with source links"
              />
            </div>
          </div>
        ) : (
          <ResultsView 
            result={result} 
            originalText={originalText}
            onReset={() => setResult(null)} 
          />
        )}
      </main>
      
      <footer className="border-t border-slate-200 py-6">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>TrustLens — AI Trust & Context Layer for Web Content</p>
          <p className="text-sm mt-2">
            We surface evidence and confidence — you decide what to trust.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
