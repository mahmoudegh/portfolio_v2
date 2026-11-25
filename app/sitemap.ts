import type { MetadataRoute } from "next";
import { getVisibleProjects, site } from "@/src/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedPaths = [
    { en: "/en", ar: "/ar" },
    { en: "/en/about", ar: "/ar/about" },
    { en: "/en/resume", ar: "/ar/resume" },
    ...getVisibleProjects().map((project) => ({
      en: `/en/project/${project.slug}`,
      ar: `/ar/project/${project.slug}`,
    })),
  ];

  const localizedEntries = localizedPaths.flatMap(({ en, ar }) => {
    const languages = { en: `${site.url}${en}`, ar: `${site.url}${ar}` };

    return [
      { url: languages.en, alternates: { languages } },
      { url: languages.ar, alternates: { languages } },
    ];
  });

  return localizedEntries;
}
