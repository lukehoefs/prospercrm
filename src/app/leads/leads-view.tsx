'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LEAD_STATUSES, type Lead, type LeadsPage, type StatusFieldInfo } from '@/lib/twenty/lead-types';

import { createLeadAction, deleteLeadAction, updateLeadAction, type ActionResult } from './actions';

function statusClasses(status: string): string {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800';
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'Qualified':
      return 'bg-green-100 text-green-800';
    case 'Lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

/**
 * Formatted in UTC deliberately. `toLocaleDateString` with the ambient zone
 * renders differently on the server and in the browser, which React reports as
 * a hydration mismatch and the reader sees as the date changing under them.
 */
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FORMAT.format(date);
}

function formatPhone(lead: Lead): string {
  const joined = [lead.phoneCallingCode, lead.phone].filter(Boolean).join(' ');
  return joined || '—';
}

/** Create and edit share this form; `lead` present means edit. */
function LeadDialog({
  lead,
  statusField,
  open,
  onOpenChange,
}: {
  lead?: Lead;
  statusField: StatusFieldInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(lead);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    isEdit ? updateLeadAction : createLeadAction,
    null,
  );

  // Close once the server confirms the write succeeded.
  useEffect(() => {
    if (state?.ok) onOpenChange(false);
  }, [state, onOpenChange]);

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const statusOptions = statusField.options.length > 0 ? statusField.options : [...LEAD_STATUSES];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit lead' : 'Add lead'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update this lead in Twenty.' : 'This creates a new person in Twenty.'}
            </DialogDescription>
          </DialogHeader>

          {lead ? <input type="hidden" name="id" value={lead.id} /> : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={lead?.firstName} />
              {fieldErrors.firstName ? (
                <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={lead?.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={lead?.email} />
            {fieldErrors.email ? <p className="text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone {lead?.phoneCallingCode ? `(${lead.phoneCallingCode})` : null}
              </Label>
              <Input id="phone" name="phone" defaultValue={lead?.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={lead?.city} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={lead?.jobTitle} />
            </div>
            {/*
              The status control only exists when the workspace has the field.
              Rendering it otherwise would collect a value that Twenty either
              rejects or silently discards.
            */}
            {statusField.available ? (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={lead?.status ?? statusOptions[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          {state && !state.ok ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteLeadDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    deleteLeadAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Delete lead</DialogTitle>
            <DialogDescription>
              This deletes {lead.displayName} from Twenty. The record is a Person, so anything
              linked to them — notes, tasks, emails — is affected too.
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="id" value={lead.id} />

          {state && !state.ok ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LeadsView({ page }: { page: LeadsPage }) {
  const { leads, statusField, limit, truncated } = page;

  const [query, setQuery] = useState('');
  const [createSeq, setCreateSeq] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) =>
      [lead.displayName, lead.email, lead.company, lead.jobTitle, lead.city]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [leads, query]);

  const countLabel = truncated
    ? `Newest ${limit} of more than ${limit} leads`
    : `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-slate-500 mt-2">{countLabel} from Twenty.</p>
        </div>
        <Button
          onClick={() => {
            // Bump the key so a previous attempt's error does not greet the
            // next open with a stale banner over an empty form.
            setCreateSeq((seq) => seq + 1);
            setCreating(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      {!statusField.available ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Status isn’t tracked in this workspace. Twenty has no status field on Person by default —
          add a SELECT field named <code className="font-mono">{statusField.name}</code> under
          Settings → Data model → Person to enable it here.
        </div>
      ) : null}

      {truncated ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Showing the {limit} most recently added leads. Search filters this page only, so older
          records won’t appear in results.
        </div>
      ) : null}

      <Card>
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    {leads.length === 0
                      ? 'No leads in Twenty yet. Add one to get started.'
                      : 'No leads match that search.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.displayName}
                      {lead.jobTitle ? (
                        <span className="block text-xs text-slate-500">{lead.jobTitle}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{lead.company || '—'}</TableCell>
                    <TableCell>{lead.email || '—'}</TableCell>
                    <TableCell>{formatPhone(lead)}</TableCell>
                    <TableCell>
                      {/* No status is rendered as absent, never as a real value. */}
                      {lead.status ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses(lead.status)}`}
                        >
                          {lead.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${lead.displayName}`}
                        onClick={() => setEditing(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${lead.displayName}`}
                        onClick={() => setDeleting(lead)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {creating ? (
        <LeadDialog
          key={`create-${createSeq}`}
          statusField={statusField}
          open
          onOpenChange={(next) => !next && setCreating(false)}
        />
      ) : null}

      {/* Keyed so the form resets when a different lead is opened. */}
      {editing ? (
        <LeadDialog
          key={editing.id}
          lead={editing}
          statusField={statusField}
          open
          onOpenChange={(next) => !next && setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <DeleteLeadDialog
          key={deleting.id}
          lead={deleting}
          open
          onOpenChange={(next) => !next && setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
