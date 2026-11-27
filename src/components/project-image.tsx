export type ResponsiveProjectCardImage = {
  src: string;
  srcSet: string;
};

export type ProjectCardImageSet = {
  mobile: ResponsiveProjectCardImage | null;
  tablet: ResponsiveProjectCardImage | null;
  phone: ResponsiveProjectCardImage[];
};

export type ProjectDetailHeroImageSet = Record<"mobile" | "tablet" | "desktop" | "largeDesktop", ResponsiveProjectCardImage | null>;

const projectCardImageSizes =
  "(max-width: 639px) calc((100vw - 44px) / 2), (max-width: 767px) calc((100vw - 60px) / 2), (max-width: 1023px) calc((100vw - 64px) / 2), (max-width: 1919px) calc((100vw - 80px) / 3), calc((100vw - 96px) / 4)";

const projectDetailHeroImageSizes =
  "(max-width: 639px) calc(100vw - 2rem), calc(100vw - 3rem)";

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
        <source media="(min-width: 1440px)" srcSet={images.largeDesktop.srcSet} sizes={projectDetailHeroImageSizes} />
      )}
      {images.desktop && (
        <source media="(min-width: 1024px)" srcSet={images.desktop.srcSet} sizes={projectDetailHeroImageSizes} />
      )}
      {images.tablet && (
        <source media="(min-width: 768px)" srcSet={images.tablet.srcSet} sizes={projectDetailHeroImageSizes} />
      )}
      <img
        src={images.mobile.src}
        srcSet={images.mobile.srcSet}
        sizes={projectDetailHeroImageSizes}
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
  const image = images?.phone?.[ratioIndex] ?? images?.phone?.[0] ?? null;

  if (!image) {
    return (
      <div aria-hidden="true" className="project-image-placeholder h-full w-full" style={{ height: "100%" }}>
        <span className="project-image-placeholder-mark">MG</span>
        <span className="project-image-placeholder-title">{title}</span>
        <span className="project-image-placeholder-note">{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={projectCardImageSizes}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  );
}
