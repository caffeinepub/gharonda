import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Home,
  Menu,
  MessageCircle,
  Plus,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const navLinks = [
    { to: "/", label: "Browse", icon: <Home className="w-3.5 h-3.5" /> },
    {
      to: "/inbox",
      label: "Inbox",
      icon: <MessageCircle className="w-3.5 h-3.5" />,
      requiresAuth: true,
    },
    {
      to: "/post-property",
      label: "Post Property",
      icon: <Plus className="w-3.5 h-3.5" />,
      requiresAuth: true,
    },
    {
      to: "/my-properties",
      label: "My Properties",
      icon: <Building2 className="w-3.5 h-3.5" />,
      requiresAuth: true,
    },
  ];

  const visibleLinks = navLinks.filter((l) => !l.requiresAuth || isLoggedIn);

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      {/* Gold accent top-line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-accent/80 via-accent to-accent/40" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <img
            src="/assets/generated/gharonda-logo-transparent.dim_200x200.png"
            alt="Gharonda"
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-[1.2rem] font-bold tracking-tight text-primary-foreground">
              Gharonda
            </span>
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-accent/90">
              Chandigarh Real Estate
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 ${
                currentPath === link.to
                  ? "text-accent bg-white/8"
                  : "text-primary-foreground/75 hover:text-primary-foreground hover:bg-white/8"
              }`}
              data-ocid="nav.link"
            >
              {link.icon}
              {link.label}
              {/* Active indicator */}
              {currentPath === link.to && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link to="/profile" data-ocid="nav.link">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-sm gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  {profile?.name || "Profile"}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-white/20 text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground text-sm"
                data-ocid="nav.button"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-accent text-accent-foreground hover:bg-accent/85 font-semibold text-sm px-4 shadow-gold-sm"
              data-ocid="nav.button"
            >
              {isLoggingIn ? "Signing in..." : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-primary border-t border-white/10 px-4 py-3 flex flex-col gap-1"
          >
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-md text-sm transition-colors ${
                  currentPath === link.to
                    ? "text-accent bg-white/8"
                    : "text-primary-foreground/80 hover:text-accent"
                }`}
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.link"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-1 border-t border-white/10">
              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-primary-foreground/70 w-full justify-start"
                  data-ocid="nav.button"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="bg-accent text-accent-foreground w-full font-semibold"
                  data-ocid="nav.button"
                >
                  {isLoggingIn ? "Signing in..." : "Login"}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
