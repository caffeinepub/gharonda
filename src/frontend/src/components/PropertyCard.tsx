import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bath, Bed, MapPin, Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import { type Property, PropertyType } from "../backend.d";

export function formatINR(price: bigint) {
  const num = Number(price);
  if (num >= 10_000_000) return `\u20b9${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000) return `\u20b9${(num / 100_000).toFixed(2)} L`;
  return `\u20b9${num.toLocaleString("en-IN")}`;
}

const TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.apartment]: "Apartment",
  [PropertyType.villa]: "Villa",
  [PropertyType.plot]: "Plot",
  [PropertyType.commercial]: "Commercial",
};

const FALLBACK_IMAGES: Record<PropertyType, string> = {
  [PropertyType.apartment]:
    "/assets/generated/prop-apartment-1.dim_600x400.jpg",
  [PropertyType.villa]: "/assets/generated/prop-villa-1.dim_600x400.jpg",
  [PropertyType.plot]: "/assets/generated/prop-plot-1.dim_600x400.jpg",
  [PropertyType.commercial]:
    "/assets/generated/prop-commercial-1.dim_600x400.jpg",
};

interface Props {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: Props) {
  const imgSrc =
    property.imageIds.length > 0
      ? property.imageIds[0].getDirectURL()
      : FALLBACK_IMAGES[property.propertyType];

  const isPlot =
    property.propertyType === PropertyType.plot ||
    property.propertyType === PropertyType.commercial;
  const isAvailable = property.status === "available";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link to="/property/$id" params={{ id: String(property.id) }}>
        <article className="group overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1.5 cursor-pointer border border-border/60 hover:border-accent/30">
          {/* Image well — 4:3 ratio for generous proportions */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={imgSrc}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />

            {/* Cinematic gradient bottom scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Hover CTA overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-5 py-2.5 rounded-full shadow-gold-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                View Property <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span
                className={`inline-flex items-center text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full ${
                  isAvailable
                    ? "bg-emerald-600/90 text-white backdrop-blur-sm"
                    : "bg-black/50 text-white/80 backdrop-blur-sm"
                }`}
              >
                {isAvailable ? "Available" : "Sold"}
              </span>
            </div>

            {/* Type badge — bottom right of image */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-black/50 text-white/90 backdrop-blur-sm">
                {TYPE_LABELS[property.propertyType]}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div className="p-5">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium tracking-wide uppercase mb-2">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="truncate">{property.location}</span>
            </div>

            {/* Title */}
            <h3 className="font-display text-[1.05rem] font-semibold leading-snug line-clamp-2 text-foreground tracking-display-tight">
              {property.title}
            </h3>

            {/* Price — dominant, gold, with left accent rule */}
            <div className="mt-3 flex items-baseline gap-2">
              <div className="w-0.5 h-5 rounded-full bg-accent shrink-0" />
              <p className="text-accent font-display font-bold text-xl tracking-display-tight leading-none">
                {formatINR(property.price)}
              </p>
            </div>

            {/* Specs row */}
            {!isPlot ? (
              <div className="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-border/60 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {String(property.bedrooms)}
                  </span>{" "}
                  BHK
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {String(property.bathrooms)}
                  </span>{" "}
                  Bath
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {String(property.areaSqFt)}
                  </span>{" "}
                  sqft
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-border/60 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {String(property.areaSqFt)}
                  </span>{" "}
                  sqft
                </span>
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
