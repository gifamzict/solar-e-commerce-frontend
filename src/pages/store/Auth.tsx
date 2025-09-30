import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun } from "lucide-react";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Sun className="h-16 w-16 text-primary mx-auto mb-4 solar-pulse" />
          <h1 className="text-3xl font-bold mb-2">Welcome to SolarGlow Tech</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" className="mt-2" />
                </div>
                <Button className="w-full solar-glow" disabled={isLoading}>
                  Sign In
                </Button>
                <Button variant="outline" className="w-full">
                  <img src="/placeholder.svg" alt="Google" className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" placeholder="John Doe" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" className="mt-2" />
                </div>
                <Button className="w-full solar-glow" disabled={isLoading}>
                  Create Account
                </Button>
                <Button variant="outline" className="w-full">
                  <img src="/placeholder.svg" alt="Google" className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
