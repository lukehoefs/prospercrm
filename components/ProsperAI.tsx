'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, X, Send, Bot, User, Loader2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export function ProsperAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; isThinking?: boolean }[]>([
    { role: 'model', text: 'Hi! I am Prosper AI. I can help you analyze leads, draft quotes, or answer questions about screen printing and fulfillment. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Use high thinking for complex queries, otherwise flash
      const isComplex = userMessage.length > 50 || userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('strategy');
      
      const modelName = isComplex ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
      const config: any = {
        systemInstruction: "You are Prosper AI, an expert assistant built into the Prosper Manufacturing OS. You help operators, sales reps, and admins manage a screen printing and fulfillment business. Be concise, highly intelligent, and action-oriented. Format your responses with clear markdown.",
      };

      if (isComplex) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      // Build history
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents as any,
        config
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I could not generate a response.', isThinking: isComplex }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-2xl bg-royal hover:bg-royal/90 text-white flex items-center justify-center p-0"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-dark-gray/10 bg-white"
          >
            <div className="bg-navy text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-royal/20 p-1.5 rounded-md">
                  <Sparkles className="h-5 w-5 text-royal-light" />
                </div>
                <div>
                  <h3 className="font-semibold leading-none">Prosper AI</h3>
                  <p className="text-xs text-white/60 mt-1">Powered by Gemini 3.1 Pro</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-light-gray/30">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="h-8 w-8 rounded-full bg-royal/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-royal" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-royal text-white rounded-tr-sm' 
                      : 'bg-white border border-dark-gray/10 text-dark-gray rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.isThinking && (
                      <div className="flex items-center gap-1.5 text-xs text-royal mb-2 font-medium bg-royal/5 w-fit px-2 py-0.5 rounded-full">
                        <BrainCircuit className="h-3 w-3" />
                        Deep Thinking
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-dark-gray flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-royal/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-royal" />
                  </div>
                  <div className="bg-white border border-dark-gray/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-royal" />
                    <span className="text-sm text-dark-gray/60">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-dark-gray/10">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Prosper AI..."
                  className="flex-1 rounded-full bg-light-gray/50 border-dark-gray/10 focus-visible:ring-royal"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="rounded-full h-10 w-10 p-0 bg-royal hover:bg-royal/90 text-white flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
