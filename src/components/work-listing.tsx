"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Locale, Project } from "@/src/data/site";
import { Header, type CategoryFilter } from "@/src/components/header";
import { getMessages } from "@/src/data/translations";
import { ProjectCardImage, type ProjectCardImageSet } from "@/src/components/project-image";

type ListingProject = Pick<Project, "id" | "slug" | "title" | "category" | "status" | "imageAlt"> & {
  cardImages: ProjectCardImageSet | null;
};
const desktopImageRatios = ["1 / 2", "2 / 3", "3 / 4", "4 / 5", "5 / 6", "1 / 1", "6 / 5", "4 / 3"];

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
          <div className="project-grid grid min-w-0 grid-cols-2 gap-x-3 gap-y-1 md:columns-2 md:block md:gap-4 lg:columns-3 3xl:columns-4">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} locale={locale} project={project} index={index} text={text} isVisible={isVisible} />
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
}: {
  locale: Locale;
  project: ListingProject;
  index: number;
  text: ReturnType<typeof getMessages>;
  isVisible: boolean;
}) {
  const alt = locale === "ar" ? `صورة من مشروع ${project.title}` : project.imageAlt;
  const ratioIndex = index % desktopImageRatios.length;

  return (
    <Link
      href={`/${locale}/project/${project.slug}`}
      className={`project-card group inline-block w-full break-inside-avoid transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"} mb-3 md:mb-4`}
      data-image-ratio={ratioIndex}
      data-project-slug={project.slug}
      style={{
        "--mobile-transition-delay": `${index * 50}ms`,
        "--desktop-transition-delay": `${index * 80}ms`,
      } as CSSProperties}
    >
      <div className="project-card-image relative overflow-hidden rounded-2xl border border-border bg-muted md:rounded-3xl">
        <ProjectCardImage
          images={project.cardImages}
          title={project.title}
          alt={alt}
          placeholderLabel={locale === "ar" ? "معاينة المشروع" : "Project preview"}
          ratioIndex={ratioIndex}
          eager={index === 0}
          className="block h-full w-full object-cover object-top"
        />
      </div>
      <div className="project-card-caption px-0.5 pt-2 pb-3 md:px-1 md:pt-3 md:pb-4">
        <h2 className="line-clamp-1 text-xs font-medium transition-opacity duration-300 group-hover:opacity-70 md:text-sm">
          {project.title}
        </h2>
        <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
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
