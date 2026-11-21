import type { MetadataRoute } from "next";
import { getVisibleProjects, site } from "@/src/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: "/en", alternate: "/ar" },
    { path: "/en/about", alternate: "/ar/about" },
    ...getVisibleProjects().map((project) => ({
      path: `/en/project/${project.slug}`,
      alternate: `/ar/project/${project.slug}`,
    })),
  ];

  return paths.map(({ path, alternate }) => ({
    url: `${site.url}${path}`,
    alternates: { languages: { en: `${site.url}${path}`, ar: `${site.url}${alternate}` } },
  }));
}
