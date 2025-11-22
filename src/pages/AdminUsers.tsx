import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddAdminDialog } from "@/components/AddAdminDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://solar-e-commerce-backend-production.up.railway.app/api") + "/";

const roleColors = {
  "Super Admin": "bg-primary text-primary-foreground",
  "Manager": "bg-accent text-accent-foreground",
  "Support": "bg-secondary text-secondary-foreground",
  "Sales": "bg-muted text-muted-foreground",
};

export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{ id: number; first_name: string; last_name: string; email: string; phone_number: string; role: string; permissions: string[] }>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "",
    permissions: [],
  });

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}admins`);
      const data = Array.isArray(response.data.admins) ? response.data.admins : [];
      setAdminUsers(data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setAdminUsers([]); // Fallback to an empty array on error
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleEditAdmin = async (id: number, updatedData: { [key: string]: any }) => {
    try {
      const requiredFields = ["first_name", "last_name", "email", "phone_number", "role", "permissions"];
      const validData: { [key: string]: any } = requiredFields.reduce((acc, field) => {
        if (updatedData[field] !== undefined) {
          acc[field] = updatedData[field];
        }
        return acc;
      }, {});

      if (updatedData.password && updatedData.password_confirmation) {
        validData.password = updatedData.password;
        validData.password_confirmation = updatedData.password_confirmation;
      }

      const response = await axios.put(`${API_BASE_URL}admins/${id}`, validData);
      alert("Admin updated successfully!");
      fetchAdminUsers();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message || error.response.statusText);
      } else {
        alert("Network error or failed to connect.");
      }
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      await axios.delete(`${API_BASE_URL}admins/${id}`);
      alert("Admin deleted successfully!");
      // Optionally, refetch the admin list to reflect changes
      fetchAdminUsers();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message || error.response.statusText);
      } else {
        alert("Network error or failed to connect.");
      }
    }
  };

  const openEditDialog = (user) => {
    setEditFormData(user);
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    await handleEditAdmin(editFormData.id, editFormData);
    setEditDialogOpen(false);
  };

  return (
    <div className= "space-y-6 animate-fade-in" >
    <div className="flex items-center justify-between" >
      <div>
      <h1 className="text-3xl font-bold tracking-tight" > Admin Users </h1>
        < p className = "text-muted-foreground mt-1" > Manage G - Tech administrators </p>
          </div>
          < AddAdminDialog />
          </div>

          < Card >
          <CardHeader>
          <CardTitle className="flex items-center gap-2" >
            <Shield className="h-5 w-5" />
              Admin Team Members
                </CardTitle>
                </CardHeader>
                < CardContent >
                <Table>
                <TableHeader>
                <TableRow>
                <TableHead>User </TableHead>
                < TableHead > Email </TableHead>
                < TableHead > Role </TableHead>
                < TableHead > Last Login </TableHead>
                  < TableHead > Status </TableHead>
                  < TableHead className = "text-right" > Actions </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
  {
    adminUsers.map((user) => (
      <TableRow key= { user.id } className = "hover:bg-muted/50 transition-colors" >
      <TableCell>
      <div className="flex items-center gap-3" >
    <Avatar>
    <AvatarFallback>{(user.name || `${user.first_name} ${user.last_name}`).split(" ").map((n) => n[0]).join("")} </AvatarFallback>
      </Avatar>
      < span className = "font-medium" > { user.name } </span>
        </div>
        </TableCell>
        < TableCell className = "text-muted-foreground" > { user.email } </TableCell>
          < TableCell >
          <Badge className={ roleColors[user.role as keyof typeof roleColors] }>
            { user.role }
            </Badge>
            </TableCell>
            < TableCell className = "text-muted-foreground" > { user.lastLogin } </TableCell>
              < TableCell >
              <Badge variant="secondary" > { user.status } </Badge>
                </TableCell>
                < TableCell className = "text-right" >
                  <div className="flex justify-end gap-2" >
                    <Button
                        variant="ghost"
  size = "icon"
  onClick = {() => openEditDialog(user)
}
                      >
  <Edit className="h-4 w-4" />
    </Button>
    < Button
variant = "ghost"
size = "icon"
className = "text-destructive hover:text-destructive"
onClick = {() => handleDeleteAdmin(user.id)}
                      >
  <Trash2 className="h-4 w-4" />
    </Button>
    </div>
    </TableCell>
    </TableRow>
              ))}
</TableBody>
  </Table>
  </CardContent>
  </Card>

  < Dialog open = { editDialogOpen } onOpenChange = { setEditDialogOpen } >
    <DialogContent>
    <DialogHeader>
    <DialogTitle>Edit Admin </DialogTitle>
      </DialogHeader>
      < form onSubmit = { handleEditFormSubmit } className = "space-y-4" >
        <div className="grid grid-cols-2 gap-4" >
          <div className="space-y-2" >
            <Label htmlFor="first_name" > First Name </Label>
              < Input
id = "first_name"
name = "first_name"
value = { editFormData.first_name || "" }
onChange = { handleEditFormChange }
  />
  </div>
  < div className = "space-y-2" >
    <Label htmlFor="last_name" > Last Name </Label>
      < Input
id = "last_name"
name = "last_name"
value = { editFormData.last_name || "" }
onChange = { handleEditFormChange }
  />
  </div>
  </div>
  < div className = "space-y-2" >
    <Label htmlFor="email" > Email </Label>
      < Input
id = "email"
name = "email"
type = "email"
value = { editFormData.email || "" }
onChange = { handleEditFormChange }
  />
  </div>
  < div className = "space-y-2" >
    <Label htmlFor="phone_number" > Phone Number </Label>
      < Input
id = "phone_number"
name = "phone_number"
type = "tel"
value = { editFormData.phone_number || "" }
onChange = { handleEditFormChange }
  />
  </div>
  < div className = "space-y-2" >
    <Label htmlFor="role" > Role </Label>
      < Select
onValueChange = {(value) =>
setEditFormData({ ...editFormData, role: value })
                }
value = { editFormData.role || "" }
  >
  <SelectTrigger>
  <SelectValue placeholder="Select role" />
    </SelectTrigger>
    < SelectContent >
    <SelectItem value="admin" > Admin </SelectItem>
      < SelectItem value = "manager" > Manager </SelectItem>
        < SelectItem value = "staff" > Staff </SelectItem>
          < SelectItem value = "viewer" > Viewer </SelectItem>
            </SelectContent>
            </Select>
            </div>
            < div className = "flex justify-end gap-3" >
              <Button type="button" variant = "outline" onClick = {() => setEditDialogOpen(false)}>
                Cancel
                </Button>
                < Button type = "submit" > Save Changes </Button>
                  </div>
                  </form>
                  </DialogContent>
                  </Dialog>

                  < div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
                    <Card>
                    <CardHeader className="pb-3" >
                      <CardTitle className="text-sm font-medium" > Super Admins </CardTitle>
                        </CardHeader>
                        < CardContent >
                        <div className="text-2xl font-bold" >
                          { adminUsers.filter((user) => user.role === "Super Admin").length }
                          </div>
                          </CardContent>
                          </Card>
                          < Card >
                          <CardHeader className="pb-3" >
                            <CardTitle className="text-sm font-medium" > Managers </CardTitle>
                              </CardHeader>
                              < CardContent >
                              <div className="text-2xl font-bold" >
                                { adminUsers.filter((user) => user.role === "Manager").length }
                                </div>
                                </CardContent>
                                </Card>
                                < Card >
                                <CardHeader className="pb-3" >
                                  <CardTitle className="text-sm font-medium" > Support Team </CardTitle>
                                    </CardHeader>
                                    < CardContent >
                                    <div className="text-2xl font-bold" >
                                      { adminUsers.filter((user) => user.role === "Support").length }
                                      </div>
                                      </CardContent>
                                      </Card>
                                      < Card >
                                      <CardHeader className="pb-3" >
                                        <CardTitle className="text-sm font-medium" > Sales Team </CardTitle>
                                          </CardHeader>
                                          < CardContent >
                                          <div className="text-2xl font-bold" >
                                            { adminUsers.filter((user) => user.role === "Sales").length }
                                            </div>
                                            </CardContent>
                                            </Card>
                                            </div>
                                            </div>
  );
}
