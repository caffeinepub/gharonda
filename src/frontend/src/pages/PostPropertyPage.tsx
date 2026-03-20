import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, PropertyStatus, PropertyType } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProperty } from "../hooks/useQueries";

const CHANDIGARH_LOCATIONS = [
  "Sector 17, Chandigarh",
  "Sector 22, Chandigarh",
  "Sector 35, Chandigarh",
  "Sector 44, Chandigarh",
  "Sector 8, Chandigarh",
  "Mohali Phase 1",
  "Mohali Phase 7",
  "Mohali Phase 11",
  "Panchkula Sector 5",
  "Panchkula Sector 15",
  "Zirakpur",
  "Kharar",
  "Aerocity Mohali",
];

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const createProperty = useCreateProperty();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    propertyType: PropertyType.apartment as PropertyType,
    bedrooms: "2",
    bathrooms: "2",
    areaSqFt: "",
  });
  const [images, setImages] = useState<
    { file: File; preview: string; blob?: ExternalBlob; progress: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const update = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview, progress: 0 }]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    if (!form.title || !form.location || !form.price || !form.areaSqFt) {
      toast.error("Please fill all required fields.");
      return;
    }

    setUploading(true);
    try {
      // Upload images
      const uploadedBlobs = await Promise.all(
        images.map(async (img, idx) => {
          const bytes = new Uint8Array(await img.file.arrayBuffer());
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
            (pct) => {
              setImages((prev) =>
                prev.map((im, i) =>
                  i === idx ? { ...im, progress: pct } : im,
                ),
              );
            },
          );
          return blob;
        }),
      );

      const isPlot =
        form.propertyType === PropertyType.plot ||
        form.propertyType === PropertyType.commercial;

      await createProperty.mutateAsync({
        id: 0n,
        title: form.title,
        description: form.description,
        price: BigInt(Math.round(Number.parseFloat(form.price) * 100000)),
        location: form.location,
        propertyType: form.propertyType,
        bedrooms: isPlot ? 0n : BigInt(form.bedrooms),
        bathrooms: isPlot ? 0n : BigInt(form.bathrooms),
        areaSqFt: BigInt(form.areaSqFt),
        imageIds: uploadedBlobs,
        sellerId: identity.getPrincipal() as any,
        status: PropertyStatus.available,
        createdAt: BigInt(Date.now()),
      });

      toast.success("Property listed successfully!");
      navigate({ to: "/my-properties" });
    } catch {
      toast.error("Failed to post property. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-semibold mb-4">
          Login Required
        </h2>
        <p className="text-muted-foreground mb-6">
          Please login to post a property listing.
        </p>
        <Button
          onClick={login}
          className="bg-primary"
          data-ocid="post.primary_button"
        >
          Login to Continue
        </Button>
      </div>
    );
  }

  const isPlot =
    form.propertyType === PropertyType.plot ||
    form.propertyType === PropertyType.commercial;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold mb-1">
          Post a Property
        </h1>
        <p className="text-muted-foreground mb-6">
          Reach thousands of buyers across Chandigarh & Tricity
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. 3BHK Apartment in Sector 22"
                  required
                  data-ocid="post.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your property..."
                  rows={4}
                  data-ocid="post.textarea"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Property Type *</Label>
                  <Select
                    value={form.propertyType}
                    onValueChange={(v) => update("propertyType", v)}
                  >
                    <SelectTrigger data-ocid="post.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PropertyType.apartment}>
                        Apartment
                      </SelectItem>
                      <SelectItem value={PropertyType.villa}>
                        Villa / House
                      </SelectItem>
                      <SelectItem value={PropertyType.plot}>Plot</SelectItem>
                      <SelectItem value={PropertyType.commercial}>
                        Commercial
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={form.location}
                    onValueChange={(v) => update("location", v)}
                  >
                    <SelectTrigger data-ocid="post.select">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANDIGARH_LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Pricing & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (in Lakhs) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="e.g. 85"
                    required
                    data-ocid="post.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="area">Area (sq.ft) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={form.areaSqFt}
                    onChange={(e) => update("areaSqFt", e.target.value)}
                    placeholder="e.g. 1850"
                    required
                    data-ocid="post.input"
                  />
                </div>
              </div>
              {!isPlot && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Bedrooms</Label>
                    <Select
                      value={form.bedrooms}
                      onValueChange={(v) => update("bedrooms", v)}
                    >
                      <SelectTrigger data-ocid="post.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n} BHK
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Bathrooms</Label>
                    <Select
                      value={form.bathrooms}
                      onValueChange={(v) => update("bathrooms", v)}
                    >
                      <SelectTrigger data-ocid="post.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="post.dropzone"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  JPG, PNG up to 10MB each
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
                data-ocid="post.upload_button"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {images.map((img, imgIdx) => (
                    <div
                      key={img.preview}
                      className="relative rounded-lg overflow-hidden h-24 bg-muted"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${imgIdx}`}
                        className="w-full h-full object-cover"
                      />
                      {img.progress > 0 && img.progress < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                          {img.progress}%
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(imgIdx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        data-ocid={`post.delete_button.${imgIdx + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground h-12 text-base font-semibold"
            disabled={uploading || createProperty.isPending}
            data-ocid="post.submit_button"
          >
            {uploading || createProperty.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Listing
                Property...
              </>
            ) : (
              "List Property"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
