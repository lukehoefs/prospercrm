'use client';

import { useState } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export function LeadAnalyzer({ lead, isOpen, onOpenChange }: { lead: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeLead = async () => {
    if (!lead) return;
    setIsAnalyzing(true);
    setAnalysis('');
    setHasAnalyzed(false);

    try {
      const prompt = `
        Analyze this sales lead for a screen printing and fulfillment company.
        
        Lead Data:
        - Company: ${lead.companyName}
        - Contact: ${lead.contactName || 'N/A'}
        - Email: ${lead.email || 'N/A'}
        - Phone: ${lead.phone || 'N/A'}
        - Order Type: ${lead.orderType}
        - Monthly Volume: ${lead.monthlyOrderVolume || 'Unknown'}
        - Stage: ${lead.stage}
        - Notes: ${lead.notes || 'None'}

        Please provide:
        1. A brief summary of the opportunity.
        2. A suggested next step or sales strategy.
        3. Potential red flags or missing information to gather.
        
        Format as clean markdown.
      `;

      const response = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "You are an expert sales strategist for a manufacturing company. Provide concise, actionable insights."
        }
      });

      let fullText = '';
      for await (const chunk of response) {
        fullText += chunk.text;
        setAnalysis(fullText);
      }
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Failed to analyze lead. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when opened if not analyzed yet
  if (isOpen && !isAnalyzing && !hasAnalyzed && analysis === '') {
    analyzeLead();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setTimeout(() => {
          setAnalysis('');
          setHasAnalyzed(false);
        }, 300);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-royal" />
            AI Lead Analysis: {lead?.companyName}
          </DialogTitle>
          <DialogDescription>
            Prosper AI is analyzing this lead&apos;s data to suggest a strategy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 bg-light-gray/30 rounded-md p-4 border border-dark-gray/10">
          {isAnalyzing && !analysis && (
            <div className="flex flex-col items-center justify-center h-40 text-royal gap-3">
              <BrainCircuit className="h-8 w-8 animate-pulse" />
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deep Thinking...
              </div>
            </div>
          )}
          
          {analysis && (
            <div className="prose prose-sm max-w-none prose-headings:text-navy prose-a:text-royal">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
