'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, LayoutGrid, List, Mail, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { format } from 'date-fns';
import { LeadAnalyzer } from '@/components/LeadAnalyzer';

const STAGES = ["New", "Contacted", "Qualified", "Quoted", "Closed Won", "Closed Lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Email State
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [emailData, setEmailData] = useState({ subject: '', body: '', cc: '', bcc: '' });
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // AI Analysis State
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [leadToAnalyze, setLeadToAnalyze] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    source: '',
    monthlyOrderVolume: '',
    orderType: 'Screen Printing',
    notes: '',
    stage: 'New'
  });

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadsData);
    });
    return () => unsubscribe();
  }, []);

  const handleDraftWithAI = async () => {
    if (!selectedLead) return;
    setIsDrafting(true);
    try {
      const res = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: selectedLead })
      });
      
      if (!res.ok) throw new Error('Failed to draft email');
      
      const data = await res.json();
      setEmailData(prev => ({
        ...prev,
        subject: data.subject || prev.subject,
        body: data.body || prev.body
      }));
    } catch (error) {
      console.error("Error drafting email:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        monthlyOrderVolume: Number(formData.monthlyOrderVolume) || 0,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid,
        lastActivity: new Date().toISOString(),
      });
      setIsDialogOpen(false);
      setFormData({
        companyName: '', contactName: '', email: '', phone: '', source: '',
        monthlyOrderVolume: '', orderType: 'Screen Printing', notes: '', stage: 'New'
      });
    } catch (error) {
      console.error("Error adding lead: ", error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      try {
        const leadRef = doc(db, 'leads', draggableId);
        await updateDoc(leadRef, {
          stage: destination.droppableId,
          lastActivity: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error updating lead stage:", error);
      }
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead?.email) return;

    setEmailStatus('sending');
    setEmailError('');

    try {
      // Fetch Gmail integration
      let gmailIntegration = null;
      if (auth.currentUser) {
        const integrationRef = doc(db, 'users', auth.currentUser.uid, 'integrations', 'gmail');
        const docSnap = await getDoc(integrationRef);
        if (docSnap.exists() && docSnap.data().connected) {
          gmailIntegration = docSnap.data();
        }
      }

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedLead.email,
          subject: emailData.subject,
          text: emailData.body,
          replyTo: auth.currentUser?.email || undefined,
          leadId: selectedLead.id,
          gmailIntegration
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const responseData = await res.json();

      // Update tokens if they were refreshed
      if (responseData.newTokens && auth.currentUser) {
        const integrationRef = doc(db, 'users', auth.currentUser.uid, 'integrations', 'gmail');
        await setDoc(integrationRef, {
          accessToken: responseData.newTokens.accessToken,
          refreshToken: responseData.newTokens.refreshToken,
          expiryDate: responseData.newTokens.expiryDate,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Log email to Firestore
      await addDoc(collection(db, 'leadEmails'), {
        leadId: selectedLead.id,
        to: selectedLead.email,
        subject: emailData.subject,
        body: emailData.body,
        sentBy: auth.currentUser?.uid,
        provider: responseData.provider || 'resend',
        sentAt: new Date().toISOString()
      });

      setEmailStatus('success');
      setTimeout(() => {
        setIsEmailDialogOpen(false);
        setEmailStatus('idle');
        setEmailData({ subject: '', body: '' });
      }, 2000);
    } catch (error: any) {
      console.error("Error sending email:", error);
      setEmailStatus('error');
      setEmailError(error.message);
    }
  };

  const openEmailDialog = (lead: any) => {
    setSelectedLead(lead);
    setEmailData({ subject: '', body: '' });
    setEmailStatus('idle');
    setEmailError('');
    setIsEmailDialogOpen(true);
  };

  const filteredLeads = leads.filter(lead => 
    lead.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-dark-gray/60">Manage inbound and outbound sales leads.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray/50" />
              <Input 
                placeholder="Search leads..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex border border-dark-gray/20 rounded-md bg-white">
              <Button 
                variant={view === 'table' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-none rounded-l-md h-10 w-10"
                onClick={() => setView('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'kanban' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-none rounded-r-md h-10 w-10"
                onClick={() => setView('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-royal hover:bg-royal/90 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleCreateLead}>
                  <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new sales lead.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input id="companyName" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input id="contactName" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderType">Order Type</Label>
                        <Select value={formData.orderType} onValueChange={v => setFormData({...formData, orderType: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Screen Printing">Screen Printing</SelectItem>
                            <SelectItem value="Fulfillment">Fulfillment</SelectItem>
                            <SelectItem value="Combined">Combined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stage">Stage</Label>
                        <Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-royal text-white hover:bg-royal/90">Save Lead</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Email Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSendEmail}>
              <DialogHeader>
                <DialogTitle>Email Lead</DialogTitle>
                <DialogDescription>
                  Send an email to {selectedLead?.contactName || selectedLead?.companyName}.
                </DialogDescription>
              </DialogHeader>
              
              {emailStatus === 'success' ? (
                <div className="py-12 flex flex-col items-center justify-center text-green-600">
                  <CheckCircle2 className="h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">Email sent successfully!</p>
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input value={selectedLead?.email || ''} disabled className="bg-light-gray" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC (Optional)</Label>
                    <Input 
                      id="cc" 
                      value={emailData.cc} 
                      onChange={e => setEmailData({...emailData, cc: e.target.value})} 
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC (Optional)</Label>
                    <Input 
                      id="bcc" 
                      value={emailData.bcc} 
                      onChange={e => setEmailData({...emailData, bcc: e.target.value})} 
                      placeholder="bcc@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required 
                      value={emailData.subject} 
                      onChange={e => setEmailData({...emailData, subject: e.target.value})} 
                      placeholder="Following up on your inquiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="body">Message</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-royal hover:text-royal/80 hover:bg-royal/10"
                        onClick={handleDraftWithAI}
                        disabled={isDrafting}
                      >
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        {isDrafting ? 'Drafting...' : 'Draft with AI'}
                      </Button>
                    </div>
                    <Textarea 
                      id="body" 
                      required 
                      className="min-h-[150px]"
                      value={emailData.body} 
                      onChange={e => setEmailData({...emailData, body: e.target.value})} 
                      placeholder="Hi there..."
                    />
                  </div>
                  {emailStatus === 'error' && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100">
                      {emailError}
                    </div>
                  )}
                </div>
              )}
              
              {emailStatus !== 'success' && (
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={emailStatus === 'sending'}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-royal text-white hover:bg-royal/90" disabled={emailStatus === 'sending' || !selectedLead?.email}>
                    {emailStatus === 'sending' ? 'Sending...' : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Email
                      </>
                    )}
                  </Button>
                </DialogFooter>
              )}
            </form>
          </DialogContent>
        </Dialog>

        {view === 'table' ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-dark-gray/50">No leads found.</TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-light-gray/80">
                      <TableCell className="font-medium">{lead.companyName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{lead.contactName || '-'}</span>
                          <span className="text-xs text-dark-gray/60">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.orderType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.stage === 'Closed Won' ? 'success' : lead.stage === 'Closed Lost' ? 'destructive' : 'secondary'}>
                          {lead.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-dark-gray/60 text-sm">
                        {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-dark-gray/60 hover:text-royal hover:bg-royal/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeadToAnalyze(lead);
                              setIsAnalyzerOpen(true);
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          {lead.email && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-dark-gray/60 hover:text-royal hover:bg-royal/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEmailDialog(lead);
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map(stage => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage);
                return (
                  <div key={stage} className="flex-shrink-0 w-80 bg-dark-gray/5 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-dark-gray/70">{stage}</h3>
                      <Badge variant="secondary">{stageLeads.length}</Badge>
                    </div>
                    <Droppable droppableId={stage}>
                      {(provided) => (
                        <div 
                          className="flex flex-col gap-3 min-h-[150px]"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <Card 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-pointer hover:border-royal/50 transition-colors group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-royal/50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="font-semibold">{lead.companyName}</div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 text-dark-gray/60 hover:text-royal hover:bg-royal/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setLeadToAnalyze(lead);
                                            setIsAnalyzerOpen(true);
                                          }}
                                        >
                                          <Sparkles className="h-3 w-3" />
                                        </Button>
                                        {lead.email && (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-dark-gray/60 hover:text-royal hover:bg-royal/10"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openEmailDialog(lead);
                                            }}
                                          >
                                            <Mail className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-sm text-dark-gray/60 mb-3">{lead.contactName || lead.email || 'No contact info'}</div>
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-[10px]">{lead.orderType}</Badge>
                                      <span className="text-xs text-dark-gray/40">
                                        {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d') : ''}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {stageLeads.length === 0 && (
                            <div className="text-center py-4 text-sm text-dark-gray/40 border-2 border-dashed border-dark-gray/10 rounded-lg">
                              Drop leads here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* AI Analyzer Dialog */}
      <LeadAnalyzer 
        lead={leadToAnalyze} 
        isOpen={isAnalyzerOpen} 
        onOpenChange={setIsAnalyzerOpen} 
      />
    </AppLayout>
  );
}
