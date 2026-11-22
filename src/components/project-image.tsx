import { getImageProps } from "next/image";
import type { Project } from "@/src/data/site";

type Props = {
  images: Project["images"];
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
};

export function ProjectImage({ images, alt, sizes, className, preload = false }: Props) {
  const smallImage = images.sm ?? images.md ?? images.lg;
  if (!smallImage) return null;

  const mediumImage = images.md ?? smallImage;
  const largeImage = images.lg ?? mediumImage;
  const sharedProps = {
    alt,
    sizes,
    quality: 80,
    fetchPriority: preload ? "high" as const : "auto" as const,
  };
  const { props: large } = getImageProps({
    ...sharedProps,
    src: largeImage.src,
    width: largeImage.width,
    height: largeImage.height,
  });
  const { props: medium } = getImageProps({
    ...sharedProps,
    src: mediumImage.src,
    width: mediumImage.width,
    height: mediumImage.height,
  });
  const { props: small } = getImageProps({
    ...sharedProps,
    src: smallImage.src,
    width: smallImage.width,
    height: smallImage.height,
  });

  return (
    <picture className="block h-full w-full">
      <source media="(min-width: 1024px)" srcSet={large.srcSet} sizes={sizes} />
      <source media="(min-width: 640px)" srcSet={medium.srcSet} sizes={sizes} />
      <img {...small} className={className} />
    </picture>
  );
}
