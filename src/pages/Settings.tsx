import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AddPickupLocationDialog } from "@/components/AddPickupLocationDialog";
import { fetchPickupLocations, PickupLocation } from "@/services/pickup-location";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

export default function Settings() {
  const [settings, setSettings] = useState({
    store_name: "Gifamz Store",
    contact_email: "contact@gifamz.com",
    phone_number: "+1 (555) 123-4567",
    payment_settings: {
      credit_card: true,
      paypal: true,
      cash_on_delivery: false,
    },
    shipping_settings: {
      free_shipping_threshold: 50,
      standard_rate: 5.99,
      express_rate: 12.99,
    },
    notification_preferences: {
      order_notifications: true,
      low_stock_alerts: true,
      customer_messages: true,
    },
  });

  const { data: pickupLocations } = useQuery<PickupLocation[]>({
    queryKey: ["pickup-locations"],
    queryFn: fetchPickupLocations,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}settings/latest`);
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}settings`, settings);
      alert(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message || error.response.statusText);
      } else {
        alert("Network error or failed to connect.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store configuration</p>
      </div>

      <div className="grid gap-6">
        {/* Pickup Locations quick manage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Pickup Locations</CardTitle>
                <CardDescription>Quickly review and add pickup locations. Use Manage All for advanced actions.</CardDescription>
              </div>
              <div className="flex gap-2">
                <AddPickupLocationDialog />
                <Button variant="outline" asChild>
                  <Link to="/management-portal/pickup-locations">Manage All</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(!pickupLocations || pickupLocations.length === 0) ? (
              <p className="text-muted-foreground">No pickup locations yet. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {pickupLocations.slice(0, 5).map((loc) => (
                  <div key={loc.id} className="flex items-start justify-between border rounded-md p-3">
                    <div>
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {loc.address_line1}{loc.address_line2 ? `, ${loc.address_line2}` : ''}, {loc.city}{loc.state ? `, ${loc.state}` : ''}, {loc.country}
                      </div>
                      {(loc.contact_person || loc.phone) && (
                        <div className="text-xs text-muted-foreground mt-1">{loc.contact_person} {loc.phone ? `• ${loc.phone}` : ''}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={loc.active ? "default" : "secondary"}>{loc.active ? "Active" : "Inactive"}</Badge>
                      {loc.is_default ? <Badge variant="outline">Default</Badge> : null}
                    </div>
                  </div>
                ))}
                {pickupLocations.length > 5 && (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/management-portal/pickup-locations">View all locations</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={settings.phone_number}
                onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment methods and gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Credit Card Payments</Label>
                <p className="text-sm text-muted-foreground">Accept credit and debit cards</p>
              </div>
              <Switch
                checked={settings.payment_settings.credit_card}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    payment_settings: { ...settings.payment_settings, credit_card: value },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>PayPal</Label>
                <p className="text-sm text-muted-foreground">Enable PayPal checkout</p>
              </div>
              <Switch
                checked={settings.payment_settings.paypal}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    payment_settings: { ...settings.payment_settings, paypal: value },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cash on Delivery</Label>
                <p className="text-sm text-muted-foreground">Allow cash payments</p>
              </div>
              <Switch
                checked={settings.payment_settings.cash_on_delivery}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    payment_settings: { ...settings.payment_settings, cash_on_delivery: value },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Settings</CardTitle>
            <CardDescription>Manage shipping options and rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="freeShipping">Free Shipping Threshold</Label>
              <Input
                id="freeShipping"
                type="number"
                value={settings.shipping_settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping_settings: {
                      ...settings.shipping_settings,
                      free_shipping_threshold: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="standardRate">Standard Shipping Rate</Label>
              <Input
                id="standardRate"
                type="number"
                value={settings.shipping_settings.standard_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping_settings: {
                      ...settings.shipping_settings,
                      standard_rate: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expressRate">Express Shipping Rate</Label>
              <Input
                id="expressRate"
                type="number"
                value={settings.shipping_settings.express_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping_settings: {
                      ...settings.shipping_settings,
                      express_rate: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about new orders</p>
              </div>
              <Switch
                checked={settings.notification_preferences.order_notifications}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      order_notifications: value,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for low inventory</p>
              </div>
              <Switch
                checked={settings.notification_preferences.low_stock_alerts}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      low_stock_alerts: value,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Customer Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified about customer inquiries</p>
              </div>
              <Switch
                checked={settings.notification_preferences.customer_messages}
                onCheckedChange={(value) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      customer_messages: value,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
