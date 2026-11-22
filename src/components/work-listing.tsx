"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale, Project } from "@/src/data/site";
import { Header, type CategoryFilter } from "@/src/components/header";
import { getMessages } from "@/src/data/translations";
import { ProjectImage } from "@/src/components/project-image";

type ListingProject = Pick<Project, "id" | "slug" | "title" | "category" | "status" | "images" | "imageAlt">;
const desktopImageRatios = ["4 / 5", "3 / 4", "4 / 3", "1 / 1", "5 / 4", "2 / 3"];

export function WorkListing({
  locale,
  projects,
}: {
  locale: Locale;
  projects: ListingProject[];
}) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const text = getMessages(locale);
  const filteredProjects = useMemo(
    () => category === "all" ? projects : projects.filter((project) => project.category === category),
    [category, projects],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header locale={locale} path="/" category={category} onCategoryChange={setCategory} />
      <main className="page-transition min-h-screen min-w-0 max-w-full overflow-x-clip bg-background">
        <section ref={sectionRef} aria-label={locale === "ar" ? "المشاريع" : "Projects"} className="project-grid-section min-w-0 max-w-full px-4 pb-24 pt-32 sm:px-6 md:pt-24">
          <h1 className="sr-only">{locale === "ar" ? "الأعمال المختارة" : "Selected work"}</h1>
          <div className="mobile-project-grid grid min-w-0 grid-cols-2 gap-x-3 gap-y-1 md:hidden">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} locale={locale} project={project} index={index} text={text} isVisible={isVisible} />
            ))}
          </div>
          <div className="desktop-project-grid hidden columns-2 gap-4 md:block lg:columns-3 3xl:columns-4">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} locale={locale} project={project} index={index} text={text} isVisible={isVisible} desktop />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ProjectCard({
  locale,
  project,
  index,
  text,
  isVisible,
  desktop = false,
}: {
  locale: Locale;
  project: ListingProject;
  index: number;
  text: ReturnType<typeof getMessages>;
  isVisible: boolean;
  desktop?: boolean;
}) {
  const alt = locale === "ar" ? `صورة من مشروع ${project.title}` : project.imageAlt;
  const cardStyle = desktop ? undefined : { aspectRatio: "4 / 5" };

  return (
    <Link
      href={`/${locale}/project/${project.slug}`}
      className={`project-card group inline-block w-full break-inside-avoid transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"} ${desktop ? "mb-4" : "mb-3"}`}
      data-image-ratio={desktop ? index % desktopImageRatios.length : undefined}
      style={{ transitionDelay: `${index * (desktop ? 80 : 50)}ms` }}
    >
      <div style={cardStyle} className={`project-card-image relative overflow-hidden border border-border bg-muted ${desktop ? "rounded-3xl" : "rounded-2xl"}`}>
        <ProjectImage
          images={project.images}
          title={project.title}
          alt={alt}
          placeholderLabel={locale === "ar" ? "معاينة المشروع" : "Project preview"}
          preload={index === 0}
          className="block h-full w-full object-cover object-top"
        />
      </div>
      <div className={`project-card-caption ${desktop ? "px-1 pt-3 pb-4" : "px-0.5 pt-2 pb-3"}`}>
        <h2 className={`${desktop ? "text-sm" : "text-xs"} line-clamp-1 font-medium transition-opacity duration-300 group-hover:opacity-70`}>
          {project.title}
        </h2>
        <p className={`${desktop ? "text-xs" : "text-[10px]"} mt-0.5 text-muted-foreground`}>
          {categoryLabel(project.category, text)}
        </p>
      </div>
    </Link>
  );
}

export function categoryLabel(category: Project["category"], text: ReturnType<typeof getMessages>) {
  switch (category) {
    case "completed":
      return text.completedProjects;
    case "development":
      return text.developmentProjects;
    case "practice-projects":
      return text.practiceProjects;
  }
}
