import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

const categories = [
  { id: 1, name: "Electronics", products: 145, subcategories: 8, status: "Active" },
  { id: 2, name: "Audio", products: 67, subcategories: 4, status: "Active" },
  { id: 3, name: "Gaming", products: 89, subcategories: 6, status: "Active" },
  { id: 4, name: "Computing", products: 123, subcategories: 10, status: "Active" },
  { id: 5, name: "Accessories", products: 234, subcategories: 12, status: "Active" },
  { id: 6, name: "Wearables", products: 45, subcategories: 3, status: "Active" },
];

export default function Categories() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories & Tags</h1>
          <p className="text-muted-foreground mt-1">Organize your product catalog</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="secondary">{category.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products:</span>
                  <span className="font-semibold">{category.products}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subcategories:</span>
                  <span className="font-semibold">{category.subcategories}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
