import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Building2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteProperty, usePropertiesBySeller } from "../hooks/useQueries";

export default function MyPropertiesPage() {
  const { identity, login } = useInternetIdentity();
  const { data: properties, isLoading } = usePropertiesBySeller(
    identity?.getPrincipal() as any,
  );
  const deleteProperty = useDeleteProperty();

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProperty.mutateAsync(id);
      toast.success("Property deleted successfully.");
    } catch {
      toast.error("Failed to delete property.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-semibold mb-3">
          My Properties
        </h2>
        <p className="text-muted-foreground mb-6">
          Login to manage your property listings.
        </p>
        <Button
          onClick={login}
          className="bg-primary"
          data-ocid="myprops.primary_button"
        >
          Login to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">My Properties</h1>
        <Link to="/post-property">
          <Button
            className="bg-primary flex items-center gap-2"
            data-ocid="myprops.primary_button"
          >
            <Plus className="w-4 h-4" /> Post New
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="myprops.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : !properties?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="myprops.empty_state"
        >
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="font-display text-xl font-semibold mb-2">
            No Listings Yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Start by posting your first property listing.
          </p>
          <Link to="/post-property">
            <Button className="bg-primary" data-ocid="myprops.primary_button">
              <Plus className="w-4 h-4 mr-2" /> Post a Property
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p, i) => (
            <div
              key={String(p.id)}
              className="relative"
              data-ocid={`myprops.item.${i + 1}`}
            >
              <PropertyCard property={p} index={i} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 z-10 h-8 w-8 shadow-md"
                    data-ocid={`myprops.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="myprops.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{p.title}" from your
                      listings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="myprops.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(p.id)}
                      className="bg-destructive hover:bg-destructive/90"
                      data-ocid="myprops.confirm_button"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
