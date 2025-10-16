import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, MessageSquare, PackageCheck } from "lucide-react";
import type { AdminCustomerPreorderItem } from "@/services/admin-customer-preorder";
import { toast } from "sonner";
import { sendCustomerPreorderNotification } from "@/services/customer-preorder-notify";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AdminCustomerPreorderItem;
}

type Mode = 'ready' | 'balance';

export default function NotifyCustomerDialog({ open, onOpenChange, item }: Props) {
  const fullyPaid = item.payment_status === 'fully_paid';
  const [mode, setMode] = useState<Mode>(fullyPaid ? 'ready' : 'balance');
  const [submitting, setSubmitting] = useState(false);

  const [channels, setChannels] = useState<{ email: boolean; sms: boolean }>({ email: true, sms: false });
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  // Balance reminder specifics
  const [deadline, setDeadline] = useState<string>("");
  const [reason, setReason] = useState<string>("Balance required to secure delivery");

  // Ready for pickup/delivery specifics
  const [readyDate, setReadyDate] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>(item.pickup_location || "");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>(item.fulfillment_method);

  // Reset defaults when dialog opens or mode changes
  useEffect(() => {
    if (!item) return;
    const product = item.preOrder?.product_name || 'your product';
    const isoToday = new Date().toISOString().slice(0, 10);

    // Sync selected fulfillment with order default on open
    if (open) setFulfillmentMethod(item.fulfillment_method);

    if (mode === 'ready') {
      const subj = (fulfillmentMethod === 'pickup')
        ? `Ready for pickup: ${product}`
        : `Ready for delivery: ${product}`;
      setSubject(subj);
      const addressLine = fulfillmentMethod === 'pickup'
        ? `Pickup Location: {{pickup_location}}`
        : `Delivery Address: {{shipping_address}}, {{shipping_city}}, {{shipping_state}}`;
      const tmpl = `Hello {{customer_name}},\n\nYour pre-ordered {{product_name}} is now ready for {{fulfillment_method}}.\n${addressLine}\nReady From: {{ready_date}}\n\nOrder: {{pre_order_number}}\nQuantity: {{quantity}}\n\nThank you,\nG‑Tech Solar`;
      setMessage(tmpl);
      setReadyDate(isoToday);
      setPickupLocation(item.pickup_location || "Main Warehouse");
    } else {
      // balance
      const subj = `Complete your balance for pre-order ${item.pre_order_number}`;
      setSubject(subj);
      const tmpl = `Hello {{customer_name}},\n\nGood news! Your {{product_name}} is arriving soon. To secure delivery, please complete your balance payment of {{remaining_amount}} by {{payment_deadline}}.\n\nPlease log in to your G‑Tech Solar app/account to complete your payment.\n\nReason: {{reason}}\nOrder: {{pre_order_number}}\nQuantity: {{quantity}}\n\nThank you,\nG‑Tech Solar`;
      setMessage(tmpl);
      const plus7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setDeadline(plus7);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  // Update the ready message/subject when fulfillment method changes (only in ready mode)
  useEffect(() => {
    if (mode !== 'ready') return;
    const product = item.preOrder?.product_name || 'your product';
    const subj = (fulfillmentMethod === 'pickup') ? `Ready for pickup: ${product}` : `Ready for delivery: ${product}`;
    setSubject(subj);

    // Ensure correct address line in message, remove the other variant
    setMessage((m) => {
      let out = m.replace(/\n?Pickup Location: \{\{pickup_location\}\}/, '');
      out = out.replace(/\n?Delivery Address: \{\{shipping_address\}\}, \{\{shipping_city\}\}, \{\{shipping_state\}\}/, '');
      const line = (fulfillmentMethod === 'pickup')
        ? `Pickup Location: {{pickup_location}}`
        : `Delivery Address: {{shipping_address}}, {{shipping_city}}, {{shipping_state}}`;
      // Insert it before the "Ready From" line if present, else append
      if (out.includes('Ready From:')) {
        out = out.replace(/Ready From:/, `${line}\nReady From:`);
      } else {
        out = out + (out.endsWith('\n') ? '' : '\n') + line;
      }
      return out;
    });
  }, [fulfillmentMethod, mode, item.preOrder?.product_name]);

  // Insert merge tag at cursor in message textarea
  const insertAtCursor = (tag: string) => {
    const el = messageRef.current;
    if (!el) {
      setMessage((m) => (m ? m + (m.endsWith(' ') ? '' : ' ') + tag : tag));
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const newVal = message.slice(0, start) + tag + message.slice(end);
    setMessage(newVal);
    setTimeout(() => {
      try {
        el.focus();
        el.selectionStart = el.selectionEnd = start + tag.length;
      } catch {}
    }, 0);
  };

  const mergeTags = useMemo(() => (
    [
      { tag: '{{customer_name}}', hint: 'Customer full name' },
      { tag: '{{product_name}}', hint: 'Product name' },
      { tag: '{{pre_order_number}}', hint: 'Order reference' },
      { tag: '{{quantity}}', hint: 'Ordered quantity' },
      { tag: '{{remaining_amount}}', hint: "Outstanding balance with currency" },
      { tag: '{{currency}}', hint: 'Currency code' },
      { tag: '{{payment_deadline}}', hint: 'Deadline for balance' },
      { tag: '{{fulfillment_method}}', hint: 'pickup or delivery' },
      { tag: '{{pickup_location}}', hint: 'Pickup spot' },
      { tag: '{{shipping_address}}', hint: 'Delivery address' },
      { tag: '{{shipping_city}}', hint: 'Delivery city' },
      { tag: '{{shipping_state}}', hint: 'Delivery state' },
      { tag: '{{ready_date}}', hint: 'Date item is ready' },
      { tag: '{{reason}}', hint: 'Reason for reminder' },
    ]
  ), []);

  const preview = useMemo(() => {
    const map: Record<string, string> = {
      '{{customer_name}}': `${item.first_name} ${item.last_name}`.trim() || 'Customer',
      '{{product_name}}': item.preOrder?.product_name || 'Product',
      '{{pre_order_number}}': item.pre_order_number || String(item.id),
      '{{quantity}}': String(item.quantity || ''),
      '{{remaining_amount}}': `${item.currency || 'NGN'} [Remaining Amount]`,
      '{{currency}}': item.currency || 'NGN',
      '{{payment_deadline}}': deadline || '[Deadline]',
      '{{fulfillment_method}}': fulfillmentMethod,
      '{{pickup_location}}': pickupLocation || '[Pickup Location]',
      '{{shipping_address}}': item.shipping_address || '[Address]',
      '{{shipping_city}}': item.city || '[City]',
      '{{shipping_state}}': item.state || '[State]',
      '{{ready_date}}': readyDate || '[Ready Date]',
      '{{reason}}': reason || '—',
    };
    let out = message;
    Object.entries(map).forEach(([k, v]) => {
      out = out.split(k).join(v);
    });
    return out;
  }, [message, item, deadline, pickupLocation, readyDate, reason, fulfillmentMethod]);

  const onSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    if (!channels.email && !channels.sms) {
      toast.error('Select at least one channel (Email or SMS)');
      return;
    }
    if (mode === 'balance' && !deadline) {
      toast.error('Please set a payment deadline');
      return;
    }
    if (mode === 'ready' && !readyDate) {
      toast.error('Please set a ready date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_preorder_id: item.id,
        mode,
        channels: Object.keys(channels).filter((k) => (channels as any)[k]),
        subject,
        message,
        payment_deadline: mode === 'balance' ? deadline : undefined,
        reason: mode === 'balance' ? reason : undefined,
        ready_date: mode === 'ready' ? readyDate : undefined,
        fulfillment_method: fulfillmentMethod,
        pickup_location: fulfillmentMethod === 'pickup' ? pickupLocation : undefined,
        shipping_address: fulfillmentMethod === 'delivery' ? item.shipping_address : undefined,
        city: fulfillmentMethod === 'delivery' ? item.city : undefined,
        state: fulfillmentMethod === 'delivery' ? item.state : undefined,
      };
      const res = await sendCustomerPreorderNotification(payload as any);
      if ((res as any)?.success === false) throw new Error((res as any)?.message || 'Failed');
      toast.success('Notification sent');
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      // Extract meaningful backend error message
      const resp = e?.response;
      let msg = e?.message || 'Failed to send notification';
      if (resp) {
        if (resp?.status === 422 && resp?.data?.errors) {
          const firstErr = Object.values(resp.data.errors).flat().at(0);
          if (firstErr) msg = String(firstErr);
        } else {
          msg = resp?.data?.message || resp?.data?.error || msg;
        }
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notify customer</DialogTitle>
          <DialogDescription>Send a message for this pre-order: ready for pickup/delivery or balance reminder.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode */}
          <div>
            <Label className="text-sm font-medium">Notification type</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem id="mode-ready" value="ready" />
                <span className="text-sm flex items-center gap-1"><PackageCheck className="h-4 w-4" /> Ready</span>
              </label>
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem id="mode-balance" value="balance" />
                <span className="text-sm flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Balance reminder</span>
              </label>
            </RadioGroup>
          </div>

          {/* Channels */}
          <div>
            <Label className="text-sm font-medium">Channels</Label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <Checkbox checked={channels.email} onCheckedChange={(v: any) => setChannels((c) => ({ ...c, email: Boolean(v) }))} />
                <span className="text-sm flex items-center gap-1"><Mail className="h-4 w-4" /> Email</span>
              </label>
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <Checkbox checked={channels.sms} onCheckedChange={(v: any) => setChannels((c) => ({ ...c, sms: Boolean(v) }))} />
                <span className="text-sm flex items-center gap-1"><MessageSquare className="h-4 w-4" /> SMS</span>
              </label>
            </div>
          </div>

          <Separator />

          {/* Mode-specific fields */}
          {mode === 'ready' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Ready from</Label>
                  <Input type="date" className="mt-2" value={readyDate} onChange={(e) => setReadyDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm font-medium">Fulfillment method</Label>
                  <RadioGroup value={fulfillmentMethod} onValueChange={(v) => setFulfillmentMethod(v as 'pickup' | 'delivery')} className="mt-2 grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                      <RadioGroupItem id="fm-pickup" value="pickup" />
                      <span className="text-sm">Pickup</span>
                    </label>
                    <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                      <RadioGroupItem id="fm-delivery" value="delivery" />
                      <span className="text-sm">Delivery</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>
              {fulfillmentMethod === 'pickup' ? (
                <div>
                  <Label className="text-sm font-medium">Pickup location</Label>
                  <Input className="mt-2" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium">Delivery address</Label>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.shipping_address || '-'} • {item.city || '-'}, {item.state || '-'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Payment deadline</Label>
                <Input type="date" className="mt-2" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm font-medium">Reason</Label>
                <Input className="mt-2" placeholder="Why are you asking for the balance?" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>
          )}

          <Separator />

          {/* Subject & message */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <Input className="mt-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Message</Label>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {mergeTags.map((t) => (
                    <button key={t.tag} type="button" className="px-2 py-1 rounded-md border hover:bg-muted" onClick={() => insertAtCursor(t.tag)} title={t.hint}>
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea ref={messageRef} className="mt-2" rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">Use merge tags to personalize messages. They will be replaced per customer/order.</p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-md border p-4 bg-muted/30">
            <div className="text-xs font-medium mb-2">Preview</div>
            <div className="text-sm whitespace-pre-wrap text-muted-foreground">{preview}</div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
