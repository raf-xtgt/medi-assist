from typing import List
from pydantic import BaseModel, Field

class ColorConfig(BaseModel):
    primary: str = Field(..., description="Primary theme color hex code")
    primary_hover: str = Field(..., description="Hover state for primary elements hex code")
    accent: str = Field(..., description="Accent or highlight color hex code")
    surface: str = Field(..., description="Component surface background hex code")
    background: str = Field(..., description="Main page background color hex code")
    text_main: str = Field(..., description="Primary heading and text color hex code")
    text_muted: str = Field(..., description="Secondary/muted text color hex code")

class BrandingConfig(BaseModel):
    font_style: str = Field(..., description="Tailwind typography and tracking classes")
    layout_shape: str = Field(..., description="Tailwind border-radius classes")
    border_style: str = Field(..., description="Tailwind borders and shadow utility classes")
    colors: ColorConfig

class HeaderContent(BaseModel):
    logo_text: str = Field(..., description="Main title or branding text of the clinic")
    tagline: str = Field(..., description="Subtext or tagline next to/under the logo")

class BodyContent(BaseModel):
    hero_title: str = Field(..., description="Main headline of the landing page")
    hero_description: str = Field(..., description="Detailed value proposition paragraph")
    features_headline: str = Field(..., description="Section heading for the bullet list")
    features: List[str] = Field(..., description="Bullet points listing clinic capabilities or core selling points")

class CtaContent(BaseModel):
    text: str = Field(..., description="Primary action button text")
    subtext: str = Field(..., description="Supporting text below the CTA button to lower friction")

class FooterContent(BaseModel):
    text: str = Field(..., description="Copyright and management information")

class SiteContent(BaseModel):
    header: HeaderContent
    body: BodyContent
    cta: CtaContent
    footer: FooterContent

class ClinicTemplateConfig(BaseModel):
    template_id: str = Field(..., description="Unique slug identifying the template UI layout engine")
    branding: BrandingConfig
    content: SiteContent

    class Config:
        # Useful if seeding from standard Python dicts or ORM models
        from_attributes = True