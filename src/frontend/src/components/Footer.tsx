export default function Footer() {
  const year = new Date().getFullYear();
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(host)}`;

  return (
    <footer className="bg-primary text-primary-foreground/70 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display text-xl font-bold text-primary-foreground">
              Gharonda
            </span>
            <p className="text-sm mt-1">
              Chandigarh's Premier Real Estate Network
            </p>
          </div>
          <div className="text-sm text-center">
            <p>Sectors 17, 22, 35 · Mohali · Panchkula · Zirakpur</p>
          </div>
          <p className="text-xs">
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
