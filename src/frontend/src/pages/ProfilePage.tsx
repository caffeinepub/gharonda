import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useSaveProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(
        (profile.role === "seller" ? "seller" : "buyer") as "buyer" | "seller",
      );
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({ name, role });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">
            Welcome to Gharonda
          </h2>
          <p className="text-muted-foreground mb-6">
            Login to manage your profile, post properties, and connect with
            buyers & sellers across Chandigarh.
          </p>
          <Button
            onClick={login}
            disabled={loginStatus === "logging-in"}
            className="w-full bg-primary h-11 text-base font-semibold"
            data-ocid="profile.primary_button"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
              </>
            ) : (
              "Login with Internet Identity"
            )}
          </Button>
        </div>
      </div>
    );
  }

  const principalStr = identity.getPrincipal().toString();
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {name || "My Profile"}
            </h1>
            <p className="text-muted-foreground text-sm truncate max-w-xs">
              {principalStr.slice(0, 30)}...
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="profile.loading_state">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <Card data-ocid="profile.card">
            <CardHeader>
              <CardTitle className="font-display">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  data-ocid="profile.input"
                />
              </div>

              <div className="space-y-2">
                <Label>I am a</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as "buyer" | "seller")}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="buyer"
                      id="buyer"
                      data-ocid="profile.radio"
                    />
                    <Label htmlFor="buyer" className="cursor-pointer">
                      Buyer / Tenant
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="seller"
                      id="seller"
                      data-ocid="profile.radio"
                    />
                    <Label htmlFor="seller" className="cursor-pointer">
                      Seller / Owner
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <Button
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="w-full bg-primary"
                data-ocid="profile.save_button"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <Button
          variant="outline"
          className="w-full mt-4 text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={clear}
          data-ocid="profile.button"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </motion.div>
    </div>
  );
}
