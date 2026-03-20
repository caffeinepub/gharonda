import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Bath,
  Bed,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Property, PropertyType } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProperties,
  useGetUserProfile,
  useSendMessage,
} from "../hooks/useQueries";

function formatINR(price: bigint) {
  const num = Number(price);
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

const TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.villa]: "Villa",
  [PropertyType.plot]: "Plot",
  [PropertyType.commercial]: "Commercial",
};

const FALLBACK_IMAGES: Record<PropertyType, string[]> = {
  [PropertyType.apartment]: [
    "/assets/generated/prop-apartment-1.dim_600x400.jpg",
  ],
  [PropertyType.villa]: ["/assets/generated/prop-villa-1.dim_600x400.jpg"],
  [PropertyType.plot]: ["/assets/generated/prop-plot-1.dim_600x400.jpg"],
  [PropertyType.commercial]: [
    "/assets/generated/prop-commercial-1.dim_600x400.jpg",
  ],
};

export default function PropertyDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { data: properties, isLoading } = useAllProperties();
  const { identity, login } = useInternetIdentity();
  const sendMessage = useSendMessage();

  const [imgIndex, setImgIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [showMessageForm, setShowMessageForm] = useState(false);

  const property: Property | undefined = properties?.find(
    (p) => String(p.id) === id,
  );
  const { data: sellerProfile } = useGetUserProfile(property?.sellerId);

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10 space-y-4"
        data-ocid="property.loading_state"
      >
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="property.error_state"
      >
        <p className="text-muted-foreground text-xl">Property not found.</p>
        <Button
          className="mt-4"
          onClick={() => navigate({ to: "/" })}
          data-ocid="property.button"
        >
          Back to Listings
        </Button>
      </div>
    );
  }

  const images =
    property.imageIds.length > 0
      ? property.imageIds.map((b) => b.getDirectURL())
      : FALLBACK_IMAGES[property.propertyType];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        propertyId: property.id,
        receiverId: property.sellerId,
        content: message.trim(),
      });
      toast.success("Message sent to seller!");
      setMessage("");
      setShowMessageForm(false);
    } catch {
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate({ to: "/" })}
        data-ocid="property.button"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Listings
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden h-72 md:h-96 mb-6 bg-muted">
          <img
            src={images[imgIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setImgIndex((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
                data-ocid="property.button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
                data-ocid="property.button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((imgUrl, imgDotIdx) => (
                  <button
                    type="button"
                    key={imgUrl}
                    onClick={() => setImgIndex(imgDotIdx)}
                    className={`w-2 h-2 rounded-full transition-all ${imgDotIdx === imgIndex ? "bg-white scale-125" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge
              className={
                property.status === "available"
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }
            >
              {property.status === "available" ? "Available" : "Sold"}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <Badge className="bg-primary text-primary-foreground mb-2">
                {TYPE_LABELS[property.propertyType]}
              </Badge>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>
            </div>

            <p className="font-display text-3xl text-accent font-bold">
              {formatINR(property.price)}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {Number(property.bedrooms) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  {String(property.bedrooms)} Bedrooms
                </span>
              )}
              {Number(property.bathrooms) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  {String(property.bathrooms)} Bathrooms
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4" />
                {String(property.areaSqFt)} sq.ft
              </span>
            </div>

            <Separator />

            <div>
              <h2 className="font-display text-xl font-semibold mb-2">
                About This Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Seller & Contact */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Seller Information
              </h3>
              <p className="text-foreground font-medium">
                {sellerProfile?.name || "Verified Seller"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Member since 2024
              </p>

              <div className="mt-4 space-y-2">
                {identity ? (
                  <>
                    <Button
                      className="w-full bg-primary"
                      onClick={() => setShowMessageForm(!showMessageForm)}
                      data-ocid="property.open_modal_button"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      data-ocid="property.secondary_button"
                    >
                      <Phone className="w-4 h-4 mr-2" /> Request Callback
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-accent text-accent-foreground"
                    onClick={login}
                    data-ocid="property.primary_button"
                  >
                    Login to Contact Seller
                  </Button>
                )}
              </div>

              {showMessageForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-2"
                  data-ocid="property.modal"
                >
                  <Textarea
                    placeholder="Hi, I'm interested in this property. Please share more details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none"
                    rows={3}
                    data-ocid="property.textarea"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary"
                      onClick={handleSendMessage}
                      disabled={sendMessage.isPending || !message.trim()}
                      data-ocid="property.submit_button"
                    >
                      {sendMessage.isPending ? "Sending..." : "Send"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowMessageForm(false)}
                      data-ocid="property.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
