"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/use-transactions";
import {
  Contact,
  ContactType,
} from "@/lib/constants";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

export function ContactManager() {
  const { data: contacts, isLoading } = useContacts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const createMut = useCreateContact();
  const updateMut = useUpdateContact();
  const deleteMut = useDeleteContact();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" />
            Contacts (Client / Vendor)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Master data for clients and vendors. Link to transactions and invoices to track who pays and who gets paid.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingContact(null);
            setFormOpen(true);
          }}
          className="bg-gold text-primary-foreground hover:bg-amber-300"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Contact
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin" />
              Loading contacts...
            </div>
          ) : (contacts || []).length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                No contacts yet. Add a client/vendor to start tracking.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditingContact(null);
                  setFormOpen(true);
                }}
                className="bg-gold text-primary-foreground hover:bg-amber-300"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add First Contact
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pl-5">
                    Name
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Type
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Email
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Phone
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Country
                  </TableHead>
                  <TableHead className="text-right pr-5 w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contacts || []).map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-border/50 hover:bg-muted/40 group"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="text-sm font-medium">{c.name}</div>
                      {c.notes && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {c.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          c.type === "CLIENT"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : c.type === "VENDOR"
                            ? "border-red-500/40 text-red-400 bg-red-500/10"
                            : "border-amber-400/40 text-amber-400 bg-amber-400/10"
                        }`}
                      >
                        {c.type === "CLIENT" ? "Client" : c.type === "VENDOR" ? "Vendor" : "Both"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {c.phone ? (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {c.country ? (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {c.country}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 pr-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-accent"
                          onClick={() => {
                            setEditingContact(c);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setPendingDelete(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Form */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingContact={editingContact}
        isPending={createMut.isPending || updateMut.isPending}
        onSubmit={(payload) => {
          if (editingContact) {
            updateMut.mutate(
              { id: editingContact.id, input: payload },
              { onSuccess: () => setFormOpen(false) }
            );
          } else {
            createMut.mutate(payload, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      {/* Delete confirm */}
      {pendingDelete && (
        <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
          <DialogContent className="sm:max-w-[420px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete Contact?
              </DialogTitle>
              <DialogDescription>
                Contact <span className="font-medium text-foreground">{pendingDelete.name}</span> will be permanently deleted. Linked transactions and invoices remain, but will lose their contact reference.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)} className="bg-background">Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (pendingDelete) deleteMut.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                Yes, delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Contact Form
function ContactForm({
  open,
  onOpenChange,
  editingContact,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingContact: Contact | null;
  isPending: boolean;
  onSubmit: (payload: {
    name: string;
    type: ContactType;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    notes?: string | null;
  }) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        {open && (
          <ContactFormInner
            key={editingContact?.id ?? "new"}
            editingContact={editingContact}
            onOpenChange={onOpenChange}
            isPending={isPending}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContactFormInner({
  editingContact,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  editingContact: Contact | null;
  onOpenChange: (o: boolean) => void;
  isPending: boolean;
  onSubmit: (payload: {
    name: string;
    type: ContactType;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    notes?: string | null;
  }) => void;
}) {
  const [name, setName] = useState(editingContact?.name ?? "");
  const [type, setType] = useState<ContactType>(editingContact?.type ?? "CLIENT");
  const [email, setEmail] = useState(editingContact?.email ?? "");
  const [phone, setPhone] = useState(editingContact?.phone ?? "");
  const [country, setCountry] = useState(editingContact?.country ?? "ID");
  const [notes, setNotes] = useState(editingContact?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Contact name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      type,
      email: email.trim() || null,
      phone: phone.trim() || null,
      country: country.trim() || null,
      notes: notes.trim() || null,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingContact ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <DialogDescription>
          Client = those who pay you. Vendor = those you pay. Both = both.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="c-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="c-name"
              placeholder="e.g. Acme Corp, John Doe, Google Singapore"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="c-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
              <SelectTrigger id="c-type" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIENT">Client (pays you)</SelectItem>
                <SelectItem value="VENDOR">Vendor (you pay)</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-country">Country</Label>
            <Input
              id="c-country"
              placeholder="ID, US, SG"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              className="bg-background uppercase"
              maxLength={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              placeholder="contact@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Phone</Label>
            <Input
              id="c-phone"
              placeholder="+62..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="c-notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="c-notes"
            placeholder="e.g. Main client since 2024, payment term net 30"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-background resize-none"
            rows={2}
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="bg-background">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-gold text-primary-foreground hover:bg-amber-300">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : editingContact ? "Update Contact" : "Add Contact"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
