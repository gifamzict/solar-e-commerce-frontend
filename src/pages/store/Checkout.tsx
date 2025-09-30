import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");

  const steps = ["Contact", "Fulfillment", "Payment"];
  const cartTotal = 1055500;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${index + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {index + 1 < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <span className="ml-2 font-medium">{step}</span>
              {index < steps.length - 1 && <div className="w-12 h-0.5 bg-muted mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Contact Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input className="mt-2" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" className="mt-2" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold">Fulfillment Method</h2>
                  <RadioGroup value={fulfillmentMethod} onValueChange={setFulfillmentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pick Up</Label>
                    </div>
                  </RadioGroup>

                  {fulfillmentMethod === "delivery" ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Address</Label>
                        <Input className="mt-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City</Label>
                          <Input className="mt-2" />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input className="mt-2" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Select Warehouse</Label>
                      <select className="w-full mt-2 border rounded-md px-3 py-2">
                        <option>Lagos - Ikeja</option>
                        <option>Abuja - Garki</option>
                        <option>Port Harcourt - GRA</option>
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <RadioGroup defaultValue="card">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Card (Paystack)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button className="flex-1 solar-glow" onClick={() => setCurrentStep(currentStep + 1)}>
                  Continue
                </Button>
              ) : (
                <Button className="flex-1 solar-glow">
                  Place Order - ₦{cartTotal.toLocaleString()}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₦{cartTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
