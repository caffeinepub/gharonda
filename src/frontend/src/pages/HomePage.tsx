import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Shield,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { PropertyType } from "../backend.d";
import PropertyCard from "../components/PropertyCard";
import { useAllProperties } from "../hooks/useQueries";

const SAMPLE_PROPERTIES = [
  {
    id: 1n,
    title: "Luxurious 3BHK Apartment in Sector 17",
    description:
      "Spacious 3BHK apartment with modern amenities, park-facing balcony, and premium fittings.",
    price: 8500000n,
    location: "Sector 17, Chandigarh",
    propertyType: PropertyType.apartment,
    bedrooms: 3n,
    bathrooms: 2n,
    areaSqFt: 1850n,
    imageIds: [],
    sellerId: { toString: () => "seller1" } as any,
    status: "available" as any,
    createdAt: BigInt(Date.now()),
  },
  {
    id: 2n,
    title: "Premium Villa with Garden \u2014 Panchkula",
    description:
      "Beautiful 4BHK villa with private garden, modular kitchen, and servant quarters.",
    price: 25000000n,
    location: "Panchkula Sector 15",
    propertyType: PropertyType.villa,
    bedrooms: 4n,
    bathrooms: 3n,
    areaSqFt: 3200n,
    imageIds: [],
    sellerId: { toString: () => "seller2" } as any,
    status: "available" as any,
    createdAt: BigInt(Date.now()),
  },
  {
    id: 3n,
    title: "Residential Plot \u2014 Aerocity Mohali",
    description:
      "Prime 250 sq yd plot in Aerocity. Freehold, registry done, ready for construction.",
    price: 12000000n,
    location: "Aerocity Mohali",
    propertyType: PropertyType.plot,
    bedrooms: 0n,
    bathrooms: 0n,
    areaSqFt: 2250n,
    imageIds: [],
    sellerId: { toString: () => "seller3" } as any,
    status: "available" as any,
    createdAt: BigInt(Date.now()),
  },
  {
    id: 4n,
    title: "Modern 2BHK in Zirakpur \u2014 Gated Society",
    description:
      "Contemporary 2BHK flat in a premium gated society with clubhouse, swimming pool, and gym.",
    price: 5500000n,
    location: "Zirakpur",
    propertyType: PropertyType.apartment,
    bedrooms: 2n,
    bathrooms: 2n,
    areaSqFt: 1250n,
    imageIds: [],
    sellerId: { toString: () => "seller4" } as any,
    status: "available" as any,
    createdAt: BigInt(Date.now()),
  },
  {
    id: 5n,
    title: "Commercial Office Space \u2014 Sector 35",
    description:
      "750 sqft ready-to-move commercial space on a main road. Ground floor, ideal for retail or office.",
    price: 9500000n,
    location: "Sector 35, Chandigarh",
    propertyType: PropertyType.commercial,
    bedrooms: 0n,
    bathrooms: 1n,
    areaSqFt: 750n,
    imageIds: [],
    sellerId: { toString: () => "seller5" } as any,
    status: "available" as any,
    createdAt: BigInt(Date.now()),
  },
  {
    id: 6n,
    title: "Independent House \u2014 Mohali Phase 7",
    description:
      "Charming 3BHK independent house with covered parking, terrace, and excellent connectivity.",
    price: 14500000n,
    location: "Mohali Phase 7",
    propertyType: PropertyType.villa,
    bedrooms: 3n,
    bathrooms: 2n,
    areaSqFt: 2000n,
    imageIds: [],
    sellerId: { toString: () => "seller6" } as any,
    status: "sold" as any,
    createdAt: BigInt(Date.now()),
  },
];

const TRUST_STATS = [
  { icon: TrendingUp, value: "2,400+", label: "Active Listings" },
  { icon: Users, value: "15,000+", label: "Verified Buyers" },
  { icon: Shield, value: "12 Sectors", label: "Across Tricity" },
];

export default function HomePage() {
  const { data: backendProperties, isLoading } = useAllProperties();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);

  const properties =
    backendProperties && backendProperties.length > 0
      ? backendProperties
      : SAMPLE_PROPERTIES;

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !search ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.propertyType === typeFilter;
      const matchesPrice =
        !maxPriceFilter || Number(p.price) <= Number(maxPriceFilter) * 100000;
      const matchesBedrooms =
        bedroomsFilter === "any" ||
        Number(p.bedrooms) >= Number(bedroomsFilter);
      return matchesSearch && matchesType && matchesPrice && matchesBedrooms;
    });
  }, [properties, search, typeFilter, maxPriceFilter, bedroomsFilter]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setMaxPriceFilter("");
    setBedroomsFilter("any");
  };

  const hasFilters =
    search ||
    typeFilter !== "all" ||
    maxPriceFilter ||
    bedroomsFilter !== "any";

  return (
    <div>
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden min-h-[540px] lg:min-h-[620px] flex items-center">
        {/* Background image */}
        <img
          src="/assets/generated/hero-chandigarh.dim_1200x600.jpg"
          alt="Chandigarh Real Estate"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Rich layered overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Subtle bottom gradient for smooth content transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative w-full container mx-auto px-4 py-20">
          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="h-px w-8 bg-accent" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-accent">
              Chandigarh\'s Premier Property Network
            </span>
          </motion.div>

          {/* Main headline — Playfair + Instrument Serif italic accent */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-display-tighter max-w-3xl text-primary-foreground"
          >
            Find Your{" "}
            <em className="font-accent-italic text-accent not-italic">Dream</em>{" "}
            Home
            <br />
            <span className="text-primary-foreground/85">in Chandigarh</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-5 text-base md:text-lg text-primary-foreground/70 max-w-lg leading-relaxed font-body"
          >
            Verified properties across Chandigarh, Mohali, Panchkula &amp;
            Zirakpur. Connect directly with owners, no agents.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-8 max-w-2xl"
          >
            <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-card-hover p-2 flex gap-2 border border-white/20">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search by location, sector, or property name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-foreground text-sm outline-none bg-transparent placeholder:text-muted-foreground/60"
                  data-ocid="home.search_input"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0 border-border text-foreground hover:bg-secondary text-sm"
                data-ocid="home.toggle"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground shrink-0 px-5 font-semibold"
                data-ocid="home.primary_button"
              >
                Search
              </Button>
            </div>
          </motion.div>

          {/* Trust stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex items-center gap-6 flex-wrap"
          >
            {TRUST_STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <span className="w-px h-6 bg-white/20" />}
                <stat.icon className="w-4 h-4 text-accent" />
                <span className="text-primary-foreground/90 text-sm">
                  <strong className="font-semibold text-primary-foreground">
                    {stat.value}
                  </strong>{" "}
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── FILTERS ───── */}
      {showFilters && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border-b border-border shadow-xs"
        >
          <div className="container mx-auto px-4 py-4 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                Property Type
              </span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40" data-ocid="home.select">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                Max Price (Lakhs)
              </span>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                className="w-36"
                data-ocid="home.input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                Min Bedrooms
              </span>
              <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                <SelectTrigger className="w-32" data-ocid="home.select">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-muted-foreground"
                data-ocid="home.button"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </Button>
            )}
          </div>
        </motion.section>
      )}

      {/* ───── LISTINGS ───── */}
      <section className="container mx-auto px-4 py-12">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-display-tight">
              {hasFilters ? "Search Results" : "Featured Properties"}
            </h2>
            <span className="gold-rule" />
            <p className="text-muted-foreground text-sm mt-2">
              {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}{" "}
              found
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="home.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" data-ocid="home.empty_state">
            <p className="text-muted-foreground text-lg">
              No properties match your search. Try adjusting your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
              data-ocid="home.button"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <div key={String(p.id)} data-ocid={`home.item.${i + 1}`}>
                <PropertyCard property={p as any} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
