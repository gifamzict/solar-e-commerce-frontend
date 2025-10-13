// filepath: /Users/gifamz/Desktop/G-TechSolar/gifamz-admin-dash/src/pages/store/PreOrderTrack.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function PreOrderTrack() {
  const [preOrderNumber, setPreOrderNumber] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (preOrderNumber.trim()) {
      // Normalize typical order numbers and encode for safe URL navigation
      const normalized = preOrderNumber.trim().toUpperCase().replace(/\s+/g, '');
      navigate(`/pre-orders/confirmation/${encodeURIComponent(normalized)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Track Your Pre-order</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your pre-order number to see its status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your pre-order number (e.g. PRE-XXXXXX)"
                  value={preOrderNumber}
                  onChange={(e) => setPreOrderNumber(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold">
                Track Pre-order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
