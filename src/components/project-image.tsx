import type { ProjectImageSet, ProjectImageVariant } from "@/src/data/site";

type Props = {
  images: ProjectImageSet;
  title: string;
  alt: string;
  placeholderLabel: string;
  className?: string;
  preload?: boolean;
};

const fallbackOrder: Record<ProjectImageVariant, ProjectImageVariant[]> = {
  mobile: ["mobile", "tablet", "desktop", "largeDesktop"],
  tablet: ["tablet", "mobile", "desktop", "largeDesktop"],
  desktop: ["desktop", "tablet", "largeDesktop", "mobile"],
  largeDesktop: ["largeDesktop", "desktop", "tablet", "mobile"],
};

function resolveVariant(images: ProjectImageSet, preferred: ProjectImageVariant) {
  return fallbackOrder[preferred].map((variant) => images[variant]).find(Boolean) ?? null;
}

export function ProjectImage({ images, title, alt, placeholderLabel, className, preload = false }: Props) {
  const mobile = resolveVariant(images, "mobile");
  const tablet = resolveVariant(images, "tablet");
  const desktop = resolveVariant(images, "desktop");
  const largeDesktop = resolveVariant(images, "largeDesktop");

  if (!mobile) {
    return (
      <div aria-hidden="true" className="project-image-placeholder h-full w-full" style={{ height: "100%" }}>
        <span className="project-image-placeholder-mark">MG</span>
        <span className="project-image-placeholder-title">{title}</span>
        <span className="project-image-placeholder-note">{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <picture className="block h-full w-full">
      {largeDesktop && <source media="(min-width: 1440px)" srcSet={largeDesktop} />}
      {desktop && <source media="(min-width: 1024px)" srcSet={desktop} />}
      {tablet && <source media="(min-width: 768px)" srcSet={tablet} />}
      <img
        src={mobile}
        alt={alt}
        className={className}
        loading={preload ? "eager" : "lazy"}
        fetchPriority={preload ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
