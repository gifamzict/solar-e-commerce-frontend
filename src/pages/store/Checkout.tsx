import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaystackPayment } from 'react-paystack';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { paymentService, type CheckoutData } from "@/services/payment";
import { toast } from "sonner";
import { initializeCustomerPreorderPaymentSession, verifyCustomerPreorderPaymentAndCreate } from "@/services/customer-preorder";

interface PaystackConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  text?: string;
  currency?: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const preorderItems = items.filter(i => i.id.startsWith('preorder-'));
  // Consider deposit available only if a positive deposit per unit is defined
  const firstPreorder = preorderItems[0];
  const depositPerUnitRaw = firstPreorder?.meta?.depositPerUnit;
  const depositAvailable = depositPerUnitRaw != null && Number(depositPerUnitRaw) > 0;
  const [preOrderPaymentType, setPreOrderPaymentType] = useState<'deposit' | 'full'>(depositAvailable ? 'deposit' : 'full');
  const [currentStep, setCurrentStep] = useState(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>("delivery");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pickupLocation: '',
  });

  const steps = ["Contact", "Fulfillment", "Payment"];

  const chosenPaymentType = depositAvailable ? preOrderPaymentType : 'full';
  const computedPayableTotal = (() => {
    if (preorderItems.length > 0) {
      const it = preorderItems[0];
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.meta?.unitPrice ?? it.price) || 0;
      const depositUnitRaw = it.meta?.depositPerUnit;
      const depositUnit = depositUnitRaw != null ? Number(depositUnitRaw) : null;
      const useDeposit = depositAvailable && chosenPaymentType === 'deposit' && depositUnit != null && depositUnit > 0;
      const perUnit = useDeposit ? depositUnit : unit;
      return Math.max(0, perUnit * qty);
    }
    return cartTotal;
  })();

  // Compute per-item payable unit for summary display
  const getItemPayableUnit = (it: any) => {
    if (String(it.id).startsWith('preorder-')) {
      const unit = Number(it.meta?.unitPrice ?? it.price) || 0;
      const depositUnitRaw = it.meta?.depositPerUnit;
      const depositUnit = depositUnitRaw != null ? Number(depositUnitRaw) : null;
      const canUseDeposit = depositAvailable && chosenPaymentType === 'deposit' && depositUnit != null && depositUnit > 0;
      return canUseDeposit ? depositUnit : unit;
    }
    return Number(it.price) || 0;
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required contact information');
      setCurrentStep(1);
      return false;
    }
    
    if (fulfillmentMethod === 'delivery' && (!formData.address || !formData.city || !formData.state)) {
      toast.error('Please fill in all delivery address details');
      setCurrentStep(2);
      return false;
    }
    
    if (fulfillmentMethod === 'pickup' && !formData.pickupLocation) {
      toast.error('Please select a pickup location');
      setCurrentStep(2);
      return false;
    }
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }
    
    return true;
  };

  const initializePayment = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Detect pre-order items
      const preorderItems = items.filter(i => i.id.startsWith('preorder-'));

      // If cart contains pre-order items, handle via pre-order flow
      if (preorderItems.length > 0) {
        // Prevent mixing with regular items for now
        if (preorderItems.length !== items.length) {
          toast.error('Please checkout pre-order items separately from regular items.');
          setLoading(false);
          return;
        }

        const preorderItem = preorderItems[0];
        const preOrderId = Number(preorderItem.id.replace('preorder-', ''));

        // Compute totals for validation/fallback
        const qtyNum = Number(preorderItem.quantity) || 0;
        const unitFull = Number(preorderItem.meta?.unitPrice ?? preorderItem.price) || 0;
        const depositUnitCandidate = preorderItem?.meta?.depositPerUnit != null ? Number(preorderItem.meta.depositPerUnit) : null;
        const depositTotal = depositUnitCandidate != null ? depositUnitCandidate * qtyNum : 0;
        const fullTotal = unitFull * qtyNum;

        // If user selected deposit but it's not valid, fallback to full
        const shouldUseDeposit = depositUnitCandidate != null && depositUnitCandidate > 0 && preOrderPaymentType === 'deposit';
        let effectivePaymentType: 'deposit' | 'full' = shouldUseDeposit ? 'deposit' : 'full';
        if (effectivePaymentType === 'deposit' && depositTotal <= 0) {
          if (fullTotal > 0) {
            toast.info('Deposit amount is zero. Switching to full payment.');
            effectivePaymentType = 'full';
          } else {
            toast.error('Invalid pricing: total amount is zero. Please contact support.');
            setLoading(false);
            return;
          }
        }
        if (!shouldUseDeposit && preOrderPaymentType === 'deposit') {
          toast.info('Deposit unavailable for this item. Switching to full payment.');
        }

        // Initialize payment session (no DB record yet)
        const session = await initializeCustomerPreorderPaymentSession({
          pre_order_id: preOrderId,
          customer_email: formData.email,
          customer_phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          quantity: preorderItem.quantity,
          fulfillment_method: fulfillmentMethod,
          shipping_address: fulfillmentMethod === 'delivery' ? formData.address : undefined,
          city: fulfillmentMethod === 'delivery' ? formData.city : undefined,
          state: fulfillmentMethod === 'delivery' ? formData.state : undefined,
          pickup_location: fulfillmentMethod === 'pickup' ? formData.pickupLocation : undefined,
          payment_type: effectivePaymentType,
          callback_url: `${window.location.origin}/pre-orders/confirmation/TBD`,
        });

        if (!session?.success) {
          toast.error(session?.message || 'Failed to initialize pre-order payment');
          setLoading(false);
          return;
        }

        if (!session.data.amount || Number(session.data.amount) <= 0) {
          toast.error('Unable to proceed: invalid payment amount.');
          setLoading(false);
          return;
        }

        // Configure Paystack for pre-order session
        const config: any = {
          reference: session.data.reference,
          email: formData.email,
          amount: Math.round(Number(session.data.amount) * 100), // kobo
          publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY!,
          text: `Pay ₦${Number(session.data.amount).toLocaleString()}`,
          currency: 'NGN',
          onSuccess: async (reference: any) => {
            try {
              const verify = await verifyCustomerPreorderPaymentAndCreate(reference.reference);
              if ((verify as any)?.success) {
                clearCart();
                toast.success('Payment successful! Pre-order confirmed.');
                const preNum = (verify as any)?.data?.pre_order_number;
                if (preNum) navigate(`/pre-orders/confirmation/${preNum}`);
                else navigate('/pre-orders');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (e) {
              console.error('Pre-order verification error:', e);
              toast.error('Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          onClose: () => setLoading(false),
        } as const;

        const initializePaystackPayment = usePaystackPayment(config);
        initializePaystackPayment(config);
        return; // End pre-order flow
      }

      const cartItems = items.map(item => ({
        product_id: Number(item.id),
        quantity: item.quantity
      }));

      const checkoutData: CheckoutData = {
        customer_email: formData.email,
        customer_phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        fulfillment_method: fulfillmentMethod,
        shipping_address: fulfillmentMethod === 'delivery' ? formData.address : undefined,
        city: fulfillmentMethod === 'delivery' ? formData.city : undefined,
        state: fulfillmentMethod === 'delivery' ? formData.state : undefined,
        pickup_location: fulfillmentMethod === 'pickup' ? formData.pickupLocation : undefined,
        payment_method: 'card',
        cart_items: cartItems,
      };

      // Initialize order payment session (no DB order yet)
      const response = await paymentService.initializePaymentSession(checkoutData);
      if (response.success) {
        const config: any = {
          reference: response.data.reference,
          email: formData.email,
          amount: Math.round(Number(response.data.amount) * 100), // Convert to kobo
          publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY!,
          text: `Pay ₦${Number(response.data.amount).toLocaleString()}`,
          currency: 'NGN',
          onSuccess: async (ref: any) => {
            try {
              const verification = await paymentService.verifyPaymentAndCreate(ref.reference);
              if (verification.success) {
                clearCart();
                toast.success('Payment successful! Order confirmed.');
                const orderNum = verification.data?.order?.order_number;
                if (orderNum) navigate(`/order-confirmation/${orderNum}`);
                else navigate('/');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (error) {
              console.error('Payment verification failed:', error);
              toast.error('Payment verification failed. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
          onClose: () => setLoading(false),
        };
        const initializePaystackPayment = usePaystackPayment(config);
        initializePaystackPayment(config);
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      const msg = (error as any)?.message || 'Failed to initialize payment. Please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleFulfillmentMethodChange = (value: 'delivery' | 'pickup') => {
    setFulfillmentMethod(value);
  };

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
                      <Input 
                        className="mt-2" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input 
                        className="mt-2" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      className="mt-2" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      type="tel" 
                      className="mt-2" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold">Fulfillment Method</h2>
                  <RadioGroup value={fulfillmentMethod} onValueChange={handleFulfillmentMethodChange}>
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
                        <Input 
                          className="mt-2" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City</Label>
                          <Input 
                            className="mt-2" 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input 
                            className="mt-2" 
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Select Warehouse</Label>
                      <select 
                        className="w-full mt-2 border rounded-md px-3 py-2"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                        required
                      >
                        <option value="">Select a location</option>
                        <option value="Lagos - Ikeja">Lagos - Ikeja</option>
                        <option value="Abuja - Garki">Abuja - Garki</option>
                        <option value="Port Harcourt - GRA">Port Harcourt - GRA</option>
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

                  {/* Show deposit/full choice for pre-orders */}
                  {preorderItems.length > 0 ? (
                    <>
                      <RadioGroup value={chosenPaymentType} onValueChange={(val) => setPreOrderPaymentType(val as 'deposit' | 'full')}>
                        {depositAvailable && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="deposit" id="deposit" />
                            <Label htmlFor="deposit">Pay Deposit Only</Label>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full" id="full" />
                          <Label htmlFor="full">Pay in Full</Label>
                        </div>
                      </RadioGroup>
                      <div className="text-sm text-muted-foreground">
                        You will be charged ₦{computedPayableTotal.toLocaleString()} now.
                      </div>
                    </>
                  ) : (
                    <RadioGroup defaultValue="card">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Card Payment (Paystack)</Label>
                      </div>
                    </RadioGroup>
                  )}

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>By clicking "Place Order", you agree to our terms of service and privacy policy.</p>
                  </div>
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
                <Button 
                  className="flex-1 solar-glow" 
                  onClick={initializePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ₦${computedPayableTotal.toLocaleString()}`
                  )}
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
                  {items.map((item) => {
                    const unitNow = getItemPayableUnit(item);
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₦{(unitNow * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{(preorderItems.length > 0 ? computedPayableTotal : cartTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₦{(preorderItems.length > 0 ? computedPayableTotal : cartTotal).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
