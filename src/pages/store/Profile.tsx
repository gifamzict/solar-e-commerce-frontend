import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, MapPin, ShoppingBag, Heart, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ensureNairaSymbol } from "@/lib/utils";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api') + '/';

// --- Type Definitions ---
interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    // Add other fields from your API if necessary
}

interface UserStats {
    total_orders: number;
    formatted_total_spent: string;
    last_order_date: string | null;
    account_age_days: number;
}

interface UserProfileResponse {
    user: UserProfile;
    stats: UserStats;
}

interface RecentOrder {
    id: number;
    order_number: string;
    date: string;
    relative_date: string;
    formatted_total: string;
    status: string;
}

// --- API Functions ---
const fetchUserProfile = async (): Promise<UserProfileResponse> => {
    const token = localStorage.getItem("store_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.get(`${API_BASE_URL}user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const fetchRecentUserOrders = async (): Promise<RecentOrder[]> => {
    const token = localStorage.getItem("store_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.get(`${API_BASE_URL}user/orders/recent`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.recent_orders;
};

const updateUserProfile = async (userData: Partial<UserProfile>) => {
    const token = localStorage.getItem("store_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.put(`${API_BASE_URL}user/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export default function ProfilePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<UserProfile | null>(null);

    const { data: profileData, isLoading: isLoadingUser, isError: isErrorUser } = useQuery<UserProfileResponse, Error>({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
    });

    // Handle setting form state after data is fetched
    useEffect(() => {
        if (profileData) {
            setEditedUser(profileData.user);
        }
    }, [profileData]);

    const { data: recentOrders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery<RecentOrder[], Error>({
        queryKey: ['userRecentOrders'],
        queryFn: fetchRecentUserOrders,
    });

    const mutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            });
            setIsEditing(false);
            setEditedUser(data.user); // Update local state with returned user
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.response?.data?.error || "Could not save your information. Please try again.",
                variant: "destructive",
            });
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditedUser(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handleSave = () => {
        if (editedUser) {
            mutation.mutate(editedUser);
        }
    };

    const handleCancel = () => {
        if (profileData) {
            setEditedUser(profileData.user);
        }
        setIsEditing(false);
    }

    const user = profileData?.user;
    const stats = profileData?.stats;

    return (
        <div className= "container mx-auto px-4 sm:px-6 lg:px-8 py-10" >
        <div className="grid md:grid-cols-12 gap-8" >

            {/* Sidebar Navigation */ }
            < div className = "md:col-span-3" >
                <Card>
                <CardHeader>
                <CardTitle>My Account </CardTitle>
                    </CardHeader>
                    < CardContent className = "space-y-2" >
                        <Button variant="ghost" className = "w-full justify-start text-primary bg-primary/10" >
                            <User className="mr-2 h-4 w-4" /> Profile
                                </Button>
                                < Button variant = "ghost" asChild className = "w-full justify-start" >
                                    <Link to="/order-history" >
                                        <ShoppingBag className="mr-2 h-4 w-4" /> Order History
                                            </Link>
                                            </Button>



                                            < Separator className = "my-2" />
                                                <Button variant="ghost" className = "w-full justify-start text-red-500 hover:text-red-600" >
                                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                                        </Button>
                                                        </CardContent>
                                                        </Card>
                                                        </div>

    {/* Main Content */ }
    <div className="md:col-span-9 space-y-8" >

        {/* Profile Information Card */ }
        < Card >
        <CardHeader className="flex flex-row items-center justify-between" >
            <CardTitle>Personal Information </CardTitle>
                < Button onClick = {() => isEditing ? handleCancel() : setIsEditing(true)
} variant = { isEditing? "outline": "default" } >
    { isEditing? "Cancel": "Edit Profile" }
    </Button>
    </CardHeader>
    < CardContent className = "space-y-4" >
    {
        isLoadingUser?(
                                <div className = "grid sm:grid-cols-2 gap-4" >
                <div className="space-y-2"> <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" /> </div>
                    < div className = "space-y-2" > <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" /> </div>
                        < div className = "space-y-2" > <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" /> </div>
                            < div className = "space-y-2" > <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" /> </div>
                                </div>
                            ) : isErrorUser || !editedUser ? (
    <p className= "text-red-500" > Could not load profile information.</p>
                            ) : (
    <>
    <div className= "grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6" >
    <div className="p-4 bg-slate-50 rounded-lg" >
        <p className="text-2xl font-bold" > { stats?.total_orders ?? 0}</p>
            < p className = "text-sm text-muted-foreground" > Total Orders </p>
                </div>
                < div className = "p-4 bg-slate-50 rounded-lg" >
                    <p className="text-2xl font-bold" > { stats?.formatted_total_spent? ensureNairaSymbol(stats.formatted_total_spent) : '₦0.00'} </p>
                        < p className = "text-sm text-muted-foreground" > Total Spent </p>
                            </div>
                            < div className = "p-4 bg-slate-50 rounded-lg" >
                                <p className="text-2xl font-bold" > { stats?.last_order_date ?? 'N/A'}</p>
                                    < p className = "text-sm text-muted-foreground" > Last Order </p>
                                        </div>
                                        < div className = "p-4 bg-slate-50 rounded-lg" >
                                            <p className="text-2xl font-bold" > { stats?.account_age_days ?? 0}</p>
                                                < p className = "text-sm text-muted-foreground" > Days Since Join </p>
                                                    </div>
                                                    </div>
                                                    < Separator />
                                                    <div className="grid sm:grid-cols-2 gap-4 pt-4" >
                                                        <div className="space-y-2" >
                                                            <Label htmlFor="name" > Full Name </Label>
                                                                < Input id = "name" value = { editedUser.name || '' } onChange = { handleInputChange } disabled = {!isEditing} />
                                                                    </div>
                                                                    < div className = "space-y-2" >
                                                                        <Label htmlFor="email" > Email Address </Label>
                                                                            < Input id = "email" type = "email" value = { editedUser.email || '' } onChange = { handleInputChange } disabled = {!isEditing} />
                                                                                </div>

                                                                                </div>
                                                                                </>
                            )}
{
    isEditing && (
        <div className="flex justify-end pt-4" >
            <Button onClick={ handleSave } disabled = { mutation.isPending } >
                { mutation.isPending ? "Saving..." : "Save Changes" }
                </Button>
                </div>
                            )
}
</CardContent>
    </Card>

{/* Order History Card */ }
<Card>
    <CardHeader>
    <CardTitle>Recent Orders </CardTitle>
        </CardHeader>
        <CardContent>
{
    isLoadingOrders ? (
        <div className= "space-y-4" >
        {
            [...Array(3)].map((_, i) => (
                <div key= { i } className = "flex justify-between items-center p-3 rounded-lg" >
                <div><Skeleton className="h-5 w-24 mb-2" /> <Skeleton className="h-4 w-20" /> </div>
            < div className = "text-right" > <Skeleton className="h-5 w-20 mb-2" /> <Skeleton className="h-4 w-16" /> </div>
            </div>
            ))
        }
        </div>
                            ) : isErrorOrders ? (
        <p className= "text-red-500" > Could not load recent orders.</p>
                            ) : recentOrders && recentOrders.length > 0 ? (
        <div className= "space-y-4" >
        {
            recentOrders.map((order) => (
                <div key= { order.id } className = "flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" >
                <div>
                <p className="font-semibold text-primary" >#{ order.order_number } </p>
            < p className = "text-sm text-muted-foreground" > { order.date }({ order.relative_date }) </p>
            </div>
            < div className = "text-right" >
            <p className="font-bold" > { ensureNairaSymbol(order.formatted_total)
        } </p>
        < p className = {`text-sm font-semibold capitalize ${order.status.toLowerCase() === 'delivered' ? 'text-green-500' : 'text-yellow-500'}`
}>
    { order.status }
    </p>
    </div>
    </div>
                                    ))}
</div>
                            ) : (
    <p>You have no recent orders.</p>
                            )}
<div className="text-center mt-4" >
    <Button variant="link" asChild >
        <Link to="/order-history" > View All Orders </Link>
            </Button>
            </div>
            </CardContent>
            </Card>
            </div>
            </div>
            </div>
    );
}

