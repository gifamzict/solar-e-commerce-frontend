import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  submitContactForm,
  getContactInfo,
  type ContactInfo,
} from "@/services/contact";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Contact() {
  const { toast } = useToast();
  const { isAuthenticated } = useStoreAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Optional: Load contact info from API (fallback to static if fails)
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const MAP_ADDRESS = "BLOCK 44, FLAT 4, OLUWOLE HOUSING ESTATE, OGBA, LAGOS STATE, NIGERIA";
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  // Map state
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const canUseMaps = Boolean(GOOGLE_MAPS_API_KEY);
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY || "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getContactInfo();
        if (mounted) setInfo(data);
      } catch {
        // Silently ignore, static fallback will render
      } finally {
        if (mounted) setLoadingInfo(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Geocode the address once the Maps script is loaded
  useEffect(() => {
    if (!isLoaded || !canUseMaps) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: MAP_ADDRESS }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setCenter({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [isLoaded, canUseMaps]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const validate = () => {
    if (!form.full_name.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.phone_number.trim()) return "Please enter your phone number.";
    if (!form.subject.trim()) return "Please enter a subject.";
    if (!form.message.trim()) return "Please enter a message.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please login to send us a message." });
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }

    const error = validate();
    if (error) {
      toast({ title: "Validation error", description: error, variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const res = await submitContactForm(form);
      if (res.success) {
        toast({ title: "Message sent", description: res.message });
        setForm({ full_name: "", email: "", phone_number: "", subject: "", message: "" });
      } else {
        toast({ title: "Unable to send", description: res.message, variant: "destructive" });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Sorry, something went wrong. Please try again.";
      toast({ title: "Unable to send", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary to-secondary/90 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-white/90">
            Have questions? We're here to help you go solar
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-6" onSubmit={onSubmit} noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        className="mt-2"
                        value={form.full_name}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="mt-2"
                        value={form.email}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        className="mt-2"
                        value={form.phone_number}
                        onChange={onChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Product Inquiry"
                        className="mt-2"
                        value={form.subject}
                        onChange={onChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      className="mt-2 min-h-[150px]"
                      value={form.message}
                      onChange={onChange}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto solar-glow hover-lift" disabled={submitting}>
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </span>
                    ) : (
                      isAuthenticated ? "Send Message" : "Login to Send"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Visit Us</h3>
                    <p className="text-sm text-muted-foreground">
                      {info?.address || MAP_ADDRESS}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info?.phone || "+234 800 123 4567"}
                    </p>
                    {/* Optional second line if you want */}
                    {/* <p className="text-sm text-muted-foreground">+234 800 765 4321</p> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email Us</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info?.email || "info@store.gifamz.com"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      support@store.gifamz.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Mon - Fri: {info?.business_hours?.monday_friday || "8:00 AM - 6:00 PM"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Sat: {info?.business_hours?.saturday || "9:00 AM - 4:00 PM"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sun: {info?.business_hours?.sunday || "Closed"}
                    </p>
                    {!loadingInfo && info?.response_time && (
                      <p className="text-xs text-muted-foreground mt-2">{info.response_time}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <Card className="mt-8">
          <CardContent className="p-0">
            <div className="aspect-video relative">
              {canUseMaps && isLoaded && center ? (
                <GoogleMap
                  zoom={16}
                  center={center}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
                >
                  <Marker position={center} onClick={() => setInfoOpen(true)} />
                  {infoOpen && (
                    <InfoWindow position={center} onCloseClick={() => setInfoOpen(false)}>
                      <div style={{ maxWidth: 240 }}>
                        <strong>Our Address</strong>
                        <div style={{ marginTop: 4 }}>{MAP_ADDRESS}</div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <iframe
                  title="Location Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_ADDRESS)}&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
