import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Copy } from "lucide-react";

const promotions = [
  { id: 1, name: "SUMMER2024", type: "Percentage", value: "20%", uses: 145, limit: 500, expires: "2024-08-31", status: "Active" },
  { id: 2, name: "WELCOME10", type: "Percentage", value: "10%", uses: 287, limit: 1000, expires: "2024-12-31", status: "Active" },
  { id: 3, name: "FREESHIP", type: "Free Shipping", value: "Free", uses: 523, limit: null, expires: "2024-06-30", status: "Active" },
  { id: 4, name: "BLACKFRIDAY", type: "Percentage", value: "40%", uses: 0, limit: 200, expires: "2024-11-29", status: "Scheduled" },
  { id: 5, name: "SPRING15", type: "Percentage", value: "15%", uses: 198, limit: 300, expires: "2024-03-31", status: "Expired" },
];

const statusColors = {
  Active: "bg-success text-success-foreground",
  Scheduled: "bg-primary text-primary-foreground",
  Expired: "bg-muted text-muted-foreground",
};

export default function Promotions() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h1>
          <p className="text-muted-foreground mt-1">Manage coupons, deals, and sales events</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <Card key={promo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{promo.name}</CardTitle>
                    <Badge className={statusColors[promo.status as keyof typeof statusColors]}>
                      {promo.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {promo.type} • {promo.value} off
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Usage</p>
                  <p className="text-lg font-semibold">
                    {promo.uses} {promo.limit ? `/ ${promo.limit}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expires</p>
                  <p className="text-lg font-semibold">{promo.expires}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-lg font-semibold">
                    {promo.limit ? promo.limit - promo.uses : 'Unlimited'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
