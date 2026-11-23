export type ResponsiveProjectCardImage = {
  src: string;
  srcSet: string;
};

export type ProjectDetailHeroImageSet = Record<"mobile" | "tablet" | "desktop" | "largeDesktop", ResponsiveProjectCardImage | null>;

export type ProjectCardImageSet = {
  mobile: ResponsiveProjectCardImage | null;
  tablet: ResponsiveProjectCardImage | null;
  desktop: ResponsiveProjectCardImage[];
  largeDesktop: ResponsiveProjectCardImage[];
};

const projectCardImageSizes =
  "(max-width: 639px) calc((100vw - 44px) / 2), (max-width: 767px) calc((100vw - 60px) / 2), (max-width: 1023px) calc((100vw - 64px) / 2), (max-width: 1919px) calc((100vw - 64px) / 3), calc((100vw - 80px) / 4)";

export function ProjectDetailHeroImage({
  images,
  title,
  alt,
  placeholderLabel,
  className,
}: {
  images: ProjectDetailHeroImageSet | null;
  title: string;
  alt: string;
  placeholderLabel: string;
  className?: string;
}) {
  if (!images?.mobile) {
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
      {images.largeDesktop && (
        <source media="(min-width: 1440px)" srcSet={images.largeDesktop.srcSet} sizes="100vw" />
      )}
      {images.desktop && (
        <source media="(min-width: 1024px)" srcSet={images.desktop.srcSet} sizes="100vw" />
      )}
      {images.tablet && (
        <source media="(min-width: 768px)" srcSet={images.tablet.srcSet} sizes="100vw" />
      )}
      <img
        src={images.mobile.src}
        srcSet={images.mobile.srcSet}
        sizes="100vw"
        alt={alt}
        className={className}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}

export function ProjectCardImage({
  images,
  title,
  alt,
  placeholderLabel,
  className,
  ratioIndex,
  eager = false,
}: {
  images: ProjectCardImageSet | null;
  title: string;
  alt: string;
  placeholderLabel: string;
  className?: string;
  ratioIndex: number;
  eager?: boolean;
}) {
  if (!images?.mobile) {
    return (
      <div aria-hidden="true" className="project-image-placeholder h-full w-full" style={{ height: "100%" }}>
        <span className="project-image-placeholder-mark">MG</span>
        <span className="project-image-placeholder-title">{title}</span>
        <span className="project-image-placeholder-note">{placeholderLabel}</span>
      </div>
    );
  }

  const desktop = images.desktop[ratioIndex] ?? images.desktop[0];
  const largeDesktop = images.largeDesktop[ratioIndex] ?? images.largeDesktop[0];

  return (
    <picture className="block h-full w-full">
      {largeDesktop && (
        <source media="(min-width: 1440px)" srcSet={largeDesktop.srcSet} sizes={projectCardImageSizes} />
      )}
      {desktop && <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes={projectCardImageSizes} />}
      {images.tablet && (
        <source media="(min-width: 768px)" srcSet={images.tablet.srcSet} sizes={projectCardImageSizes} />
      )}
      <img
        src={images.mobile.src}
        srcSet={images.mobile.srcSet}
        sizes={projectCardImageSizes}
        alt={alt}
        className={className}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
