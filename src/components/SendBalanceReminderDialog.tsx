import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CalendarDays, Mail, MessageSquare, Link as LinkIcon, Users } from "lucide-react";
import { sendBalanceReminder } from "../services/admin-preorder-reminders";

// Minimal type copied from PreorderDetailDialog context
interface PreorderItem {
  id: number;
  name: string;
  preorder_price: number | string;
  deposit_amount?: number | string | null;
  expected_availability_date?: string | null;
}

interface Props {
  preorder: PreorderItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

// Optional helper: parse comma/whitespace separated identifiers
function parseRecipients(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_REASON = "Early arrival — stock is arriving sooner than expected";

export default function SendBalanceReminderDialog({ preorder, open, onOpenChange, onSent }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [recipientsType, setRecipientsType] = useState<'all' | 'specific'>("all");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [includePaymentLink, setIncludePaymentLink] = useState<boolean>(true);
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean; in_app: boolean }>({ email: true, sms: false, in_app: true });

  useEffect(() => {
    if (!preorder) return;
    // Default dates: expected date from preorder, deadline = +7 days
    const today = new Date();
    const plus7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isoDate = (d: Date) => d.toISOString().slice(0, 10);

    setExpectedDate(preorder.expected_availability_date ? String(preorder.expected_availability_date).slice(0, 10) : "");
    setDeadline(isoDate(plus7));

    const product = preorder.name || "your product";
    const defaultSubject = `Action required: Balance payment for your pre-order — ${product}`;
    setSubject(defaultSubject);

    const template = `Hello {{customer_name}},\n\nGood news! Your pre-ordered {{product_name}} is arriving soon.${preorder.expected_availability_date ? "\nUpdated ETA: {{expected_date}}" : ""}\n\nTo secure delivery, please complete your balance payment of {{remaining_amount}} no later than {{payment_deadline}}.${includePaymentLink ? "\n\nPay now: {{payment_link}}" : ""}\n\nOrder: {{pre_order_number}}\nQuantity: {{quantity}}\nReason: {{reason}}\n\nThank you,\nG‑Tech Solar`;
    setMessage(template);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preorder, open]);

  const mergeTags = useMemo(
    () => [
      { tag: "{{customer_name}}", hint: "Customer full name" },
      { tag: "{{product_name}}", hint: "Pre-order product name" },
      { tag: "{{pre_order_number}}", hint: "Customer pre-order reference" },
      { tag: "{{remaining_amount}}", hint: "Customer's outstanding balance (with currency)" },
      { tag: "{{expected_date}}", hint: "Updated expected arrival date" },
      { tag: "{{payment_deadline}}", hint: "Deadline for balance payment" },
      { tag: "{{quantity}}", hint: "Ordered quantity" },
      { tag: "{{fulfillment_method}}", hint: "pickup or delivery" },
      { tag: "{{pickup_location}}", hint: "If pickup" },
      { tag: "{{shipping_city}}", hint: "If delivery" },
      { tag: "{{shipping_state}}", hint: "If delivery" },
      { tag: "{{payment_link}}", hint: "Hosted link to pay remaining balance" },
      { tag: "{{reason}}", hint: "Reason for reminder/early arrival" },
      { tag: "{{original_eta}}", hint: "Original estimated arrival (optional)" },
    ],
    []
  );

  const preview = useMemo(() => {
    if (!preorder) return "";
    const map: Record<string, string> = {
      "{{customer_name}}": "Customer",
      "{{product_name}}": preorder.name,
      "{{pre_order_number}}": "CPO-XXXXXX",
      "{{remaining_amount}}": "₦[Remaining Amount]",
      "{{expected_date}}": expectedDate || "[Expected Date]",
      "{{payment_deadline}}": deadline || "[Deadline]",
      "{{quantity}}": "[Qty]",
      "{{fulfillment_method}}": "delivery",
      "{{pickup_location}}": "[Pickup Location]",
      "{{shipping_city}}": "[City]",
      "{{shipping_state}}": "[State]",
      "{{payment_link}}": includePaymentLink ? "https://pay.example/xxxxxxxx" : "[No link]",
      "{{reason}}": reason || DEFAULT_REASON,
      "{{original_eta}}": "[Original ETA]",
    };
    let out = message;
    Object.entries(map).forEach(([k, v]) => {
      out = out.split(k).join(v);
    });
    return out;
  }, [deadline, expectedDate, includePaymentLink, message, preorder, reason]);

  const expectedDateDisplay = expectedDate;

  const onSubmit = async () => {
    if (!preorder) return;
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    if (!channels.email && !channels.sms && !channels.in_app) {
      toast.error("Select at least one channel (Email, SMS or In-app)");
      return;
    }
    if (recipientsType === 'specific' && parseRecipients(recipientsRaw).length === 0) {
      toast.error("Provide at least one customer email or pre-order number");
      return;
    }

    setSubmitting(true);
    try {
      // API placeholder — backend can implement. We intentionally keep the endpoint generic.
      // POST /admin/pre-orders/{preorderId}/balance-reminders
      const payload = {
        preorder_id: preorder.id,
        recipients_type: recipientsType, // 'all' or 'specific'
        recipients: parseRecipients(recipientsRaw), // emails or pre_order_numbers
        channels: Object.keys(channels).filter((k) => (channels as any)[k]), // ['email','sms','in_app']
        subject,
        message,
        expected_date: expectedDate || undefined,
        payment_deadline: deadline || undefined,
        reason: reason || undefined,
        include_payment_link: includePaymentLink,
      };
      // Call service directly
      const res: any = await sendBalanceReminder(payload);
      if (res?.success === false) throw new Error(res?.message || "Failed to send reminder");
      toast.success("Balance reminder queued to send");
      onSent?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to send reminder");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send balance payment reminder</DialogTitle>
          <DialogDescription>
            Notify pre-order customers to complete their remaining balance for “{preorder?.name}”.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipients */}
          <div>
            <Label className="text-sm font-medium">Recipients</Label>
            <div className="mt-2">
              <RadioGroup value={recipientsType} onValueChange={(v) => setRecipientsType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="rec-all" value="all" />
                  <Label htmlFor="rec-all" className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> All customers with outstanding balance for this pre-order</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem id="rec-specific" value="specific" />
                  <Label htmlFor="rec-specific" className="text-sm">Specific customers</Label>
                </div>
              </RadioGroup>
            </div>
            {recipientsType === 'specific' && (
              <div className="mt-3">
                <Label htmlFor="recipients" className="text-xs text-muted-foreground">Enter customer emails or pre-order numbers (comma, space or new-line separated)</Label>
                <Textarea id="recipients" className="mt-2" rows={3} placeholder="e.g. john@doe.com, CPO-000123, jane@doe.com" value={recipientsRaw} onChange={(e) => setRecipientsRaw(e.target.value)} />
              </div>
            )}
          </div>

          <Separator />

          {/* Channels */}
          <div>
            <Label className="text-sm font-medium">Channels</Label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <Checkbox checked={channels.email} onCheckedChange={(v: any) => setChannels((c) => ({ ...c, email: Boolean(v) }))} />
                <span className="text-sm flex items-center gap-1"><Mail className="h-4 w-4" /> Email</span>
              </label>
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <Checkbox checked={channels.sms} onCheckedChange={(v: any) => setChannels((c) => ({ ...c, sms: Boolean(v) }))} />
                <span className="text-sm flex items-center gap-1"><MessageSquare className="h-4 w-4" /> SMS</span>
              </label>
              <label className="flex items-center gap-2 border rounded-md p-3 cursor-pointer">
                <Checkbox checked={channels.in_app} onCheckedChange={(v: any) => setChannels((c) => ({ ...c, in_app: Boolean(v) }))} />
                <span className="text-sm flex items-center gap-1"><MessageSquare className="h-4 w-4" /> In‑app</span>
              </label>
            </div>
          </div>

          <Separator />

          {/* Dates & reason */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Updated arrival date</Label>
              <Input type="date" className="mt-2" value={expectedDateDisplay} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Payment deadline</Label>
              <Input type="date" className="mt-2" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Include payment link</Label>
              <div className="mt-2">
                <Checkbox id="include-link" checked={includePaymentLink} onCheckedChange={(v: any) => setIncludePaymentLink(Boolean(v))} />
                <Label htmlFor="include-link" className="ml-2 text-sm text-muted-foreground">Attach {'{{payment_link}}'} to message</Label>
              </div>
            </div>
            <div className="sm:col-span-3">
              <Label className="text-sm font-medium">Reason</Label>
              <Input className="mt-2" placeholder="Why are you asking for the balance?" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>

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
                    <button key={t.tag} type="button" className="px-2 py-1 rounded-md border hover:bg-muted" onClick={() => setMessage((m) => (m ? m + (m.endsWith(" ") ? "" : " ") + t.tag : t.tag))} title={t.hint}>
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea className="mt-2" rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">Tip: Use the merge tags above to personalize each message. These will be replaced automatically per customer.</p>
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
            {submitting ? 'Sending…' : 'Send reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
