import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FolderTree,
  Boxes,
  Tag,
  BarChart3,
  UserCog,
  CreditCard,
  Settings,
  Store,
  CalendarClock,
  CalendarCheck2,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/management-portal", icon: LayoutDashboard },
  { title: "Orders", url: "/management-portal/orders", icon: ShoppingCart },
  { title: "Categories", url: "/management-portal/categories", icon: FolderTree },
  { title: "Products", url: "/management-portal/products", icon: Package },
  { title: "Pre-orders", url: "/management-portal/preorders", icon: CalendarClock },
  { title: "Customer Pre-orders", url: "/management-portal/customer-preorders", icon: CalendarCheck2 },
  { title: "Customers", url: "/management-portal/customers", icon: Users },
  { title: "Inventory", url: "/management-portal/inventory", icon: Boxes },
  { title: "Promotions", url: "/management-portal/promotions", icon: Tag },
  { title: "Analytics", url: "/management-portal/analytics", icon: BarChart3 },
  { title: "Admin Users", url: "/management-portal/admin-users", icon: UserCog },
  { title: "Payments", url: "/management-portal/payments", icon: CreditCard },
  { title: "Notifications", url: "/management-portal/notifications", icon: Bell },
  { title: "Settings", url: "/management-portal/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">Gifamz Store</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/management-portal"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
