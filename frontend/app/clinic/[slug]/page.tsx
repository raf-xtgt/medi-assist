import { notFound } from "next/navigation";
import { clinicHdrService } from "@/lib/api/services/clinic-hdr-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Type definitions matching the backend schema
interface ColorConfig {
  primary: string;
  primary_hover: string;
  accent: string;
  surface: string;
  background: string;
  text_main: string;
  text_muted: string;
}

interface BrandingConfig {
  font_style: string;
  layout_shape: string;
  border_style: string;
  colors: ColorConfig;
}

interface HeaderContent {
  logo_text: string;
  tagline: string;
}

interface BodyContent {
  hero_title: string;
  hero_description: string;
  features_headline: string;
  features: string[];
}

interface CtaContent {
  text: string;
  subtext: string;
}

interface FooterContent {
  text: string;
}

interface SiteContent {
  header: HeaderContent;
  body: BodyContent;
  cta: CtaContent;
  footer: FooterContent;
}

interface ClinicTemplateConfig {
  template_id: string;
  branding: BrandingConfig;
  content: SiteContent;
}

export default async function ClinicPage({ params }: PageProps) {
  const { slug } = await params;

  let clinic;
  try {
    clinic = await clinicHdrService.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!clinic.site_metadata) {
    notFound();
  }

  const config = clinic.site_metadata as unknown as ClinicTemplateConfig;

  // Build dynamic CSS variables from the config
  const dynamicStyles: React.CSSProperties = {
    "--primary": config.branding.colors.primary,
    "--primary-hover": config.branding.colors.primary_hover,
    "--accent": config.branding.colors.accent,
    "--surface": config.branding.colors.surface,
    "--bg-custom": config.branding.colors.background,
    "--text-main": config.branding.colors.text_main,
    "--text-muted": config.branding.colors.text_muted,
  } as React.CSSProperties;

  const { branding, content } = config;

  // Template-specific rendering
  if (config.template_id === "modern_minimalist") {
    return (
      <div
        style={dynamicStyles}
        className={`${branding.font_style} bg-[var(--bg-custom)] text-[var(--text-main)] min-h-screen`}
      >
        {/* Header */}
        <header className="border-b border-[var(--text-muted)]/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`${branding.layout_shape} w-10 h-10 flex items-center justify-center text-white font-bold text-lg`}
                style={{ backgroundColor: "var(--primary)" }}
              >
                {content.header.logo_text.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-main)]">
                  {content.header.logo_text}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  {content.header.tagline}
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/patient/triage" className="text-sm font-medium hover:opacity-80">
                Get Care
              </a>
              <a
                href="/patient/book"
                className={`${branding.layout_shape} ${branding.border_style} px-4 py-2 text-sm font-medium`}
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                Book Now
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main>
          <section className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {content.body.hero_title}
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
              {content.body.hero_description}
            </p>
            <div className="flex flex-col items-center gap-3">
              <a
                href="/patient/triage"
                className={`${branding.layout_shape} ${branding.border_style} px-8 py-4 text-lg font-semibold transition-colors bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white`}
              >
                {content.cta.text}
              </a>
              <p className="text-sm text-[var(--text-muted)]">{content.cta.subtext}</p>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16" style={{ backgroundColor: "var(--surface)" }}>
            <div className="max-w-4xl mx-auto px-6">
              <h3 className="text-2xl font-bold text-center mb-10">
                {content.body.features_headline}
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {content.body.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`${branding.layout_shape} p-6 border`}
                    style={{ borderColor: "var(--text-muted)/10" }}
                  >
                    <div
                      className={`w-12 h-12 ${branding.layout_shape} flex items-center justify-center mb-4`}
                      style={{ backgroundColor: "var(--primary)", color: "#fff" }}
                    >
                      <span className="text-xl font-bold">{index + 1}</span>
                    </div>
                    <p className="text-[var(--text-main)]">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--text-muted)]/10 py-6">
          <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--text-muted)]">
            {content.footer.text}
          </div>
        </footer>
      </div>
    );
  }

  // Template: clinical_professional
  if (config.template_id === "clinical_professional") {
    return (
      <div
        style={dynamicStyles}
        className={`${branding.font_style} bg-[var(--bg-custom)] text-[var(--text-main)] min-h-screen`}
      >
        {/* Header */}
        <header className="bg-[var(--surface)] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                {content.header.logo_text}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {content.header.tagline}
              </p>
            </div>
            <nav className="flex items-center gap-4">
              <a
                href="/patient/triage"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Triage Assessment
              </a>
              <a
                href="/patient/book"
                className={`${branding.layout_shape} ${branding.border_style} px-5 py-2.5 text-sm font-medium text-white`}
                style={{ backgroundColor: "var(--primary)" }}
              >
                Schedule Visit
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main>
          <section className="bg-[var(--surface)] border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-8 py-24">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  {content.body.hero_title}
                </h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-10">
                  {content.body.hero_description}
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="/patient/book"
                    className={`${branding.layout_shape} ${branding.border_style} px-8 py-4 text-base font-semibold text-white transition-colors`}
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {content.cta.text}
                  </a>
                  <span className="text-sm text-[var(--text-muted)]">
                    {content.cta.subtext}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-8">
              <h3 className="text-2xl font-bold mb-12">
                {content.body.features_headline}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {content.body.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`${branding.layout_shape} ${branding.border_style} p-8 bg-[var(--surface)]`}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center mb-5 text-white font-bold"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-[var(--text-main)] font-medium">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-[var(--surface)] py-6">
          <div className="max-w-7xl mx-auto px-8 text-sm text-[var(--text-muted)]">
            {content.footer.text}
          </div>
        </footer>
      </div>
    );
  }

  // Fallback for unknown templates - render basic content
  return (
    <div
      style={dynamicStyles}
      className={`${branding.font_style} bg-[var(--bg-custom)] text-[var(--text-main)] min-h-screen`}
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">{content.header.logo_text}</h1>
        <p className="text-[var(--text-muted)] mb-8">{content.header.tagline}</p>
        <h2 className="text-2xl font-bold mb-4">{content.body.hero_title}</h2>
        <p className="text-[var(--text-muted)] mb-8">{content.body.hero_description}</p>
        <a
          href="/patient/triage"
          className={`${branding.layout_shape} ${branding.border_style} inline-block px-6 py-3`}
          style={{ backgroundColor: "var(--primary)", color: "#fff" }}
        >
          {content.cta.text}
        </a>
      </div>
    </div>
  );
}