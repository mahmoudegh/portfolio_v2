import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/src/components/header";
import { Icon } from "@/src/components/icon";
import { getProjectBySlug, getVisibleProjects, isLocale, site } from "@/src/data/site";
import { getProjectImageSet } from "@/src/data/project-images.server";
import { getMessages } from "@/src/data/translations";
import { ProjectImage } from "@/src/components/project-image";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getVisibleProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const projectImages = getProjectImageSet(project.slug);

  const isArabic = rawLocale === "ar";
  const ownerName = isArabic ? "محمود جلال" : site.name;
  const title = project.title;
  const localizedDescription = project.description[rawLocale]?.[0];
  const description = localizedDescription || (isArabic
    ? `استكشف تفاصيل مشروع ${project.title} وروابطه المتاحة ضمن أعمال محمود جلال`
    : `Available details and project links for ${project.title} in Mahmoud Galal’s portfolio.`);
  const route = `/${rawLocale}/project/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: route,
      languages: {
        en: `/en/project/${project.slug}`,
        ar: `/ar/project/${project.slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: `${site.url}${route}`,
      title: `${title} | ${ownerName}`,
      description,
      locale: isArabic ? "ar_EG" : "en_US",
      alternateLocale: isArabic ? ["en_US"] : ["ar_EG"],
      images: [projectImages.largeDesktop ?? projectImages.desktop ?? project.fallbackImage ?? "/images/site_sharing.jpg"],
    },
    robots: process.env.VERCEL_ENV === "production" ? { index: true, follow: true } : { index: false, follow: false },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${ownerName}`,
      description,
      images: [projectImages.largeDesktop ?? projectImages.desktop ?? project.fallbackImage ?? "/images/site_sharing.jpg"],
    },
  };
}

export default function ProjectPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProjectPageFallback />}>
      <ProjectPageContent params={params} />
    </Suspense>
  );
}

async function ProjectPageContent({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const text = getMessages(locale);
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const projectImages = getProjectImageSet(project.slug);

  const projectCategoryLabel = project.category === "completed"
    ? text.completedProjects
    : project.category === "development"
      ? text.developmentProjects
      : text.practiceProjects;

  const visibleProjects = getVisibleProjects();
  const currentIndex = visibleProjects.findIndex((item) => item.slug === project.slug);
  const previousProject = currentIndex > 0 ? visibleProjects[currentIndex - 1] : undefined;
  const nextProject = currentIndex < visibleProjects.length - 1 ? visibleProjects[currentIndex + 1] : undefined;
  const statusText = project.category === "completed"
    ? text.completed
    : project.category === "development"
      ? text.underDevelopment
      : text.practice;
  return (
    <>
      <Header locale={locale} path={`/project/${project.slug}`} />
      <main className="page-transition min-h-screen min-w-0 max-w-full overflow-x-clip bg-background">
        <section className="project-detail-hero px-4 pt-20 sm:px-6">
          <div className="project-detail-image relative h-[40vh] overflow-hidden rounded-2xl border border-border bg-muted md:h-[80vh] md:rounded-3xl">
            <ProjectImage
              images={projectImages}
              title={project.title}
              alt={locale === "ar" ? `صورة من مشروع ${project.title}` : project.imageAlt}
              placeholderLabel={locale === "ar" ? "معاينة المشروع" : "Project preview"}
              preload
              className="h-full w-full object-cover object-top"
            />
          </div>
        </section>

        <section className="project-information px-6 py-8">
          <div className="max-w-4xl">
            <div className="project-heading mb-6">
              <h1 className="max-w-full break-words font-display text-5xl leading-tight md:text-7xl">{project.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">#{projectCategoryLabel} · {statusText}</p>
            </div>

            <dl className="project-facts mb-8 grid min-w-0 grid-cols-2 gap-6 sm:grid-cols-3">
              {project.date && <div><dt>{text.date}</dt><dd>{project.date[locale]}</dd></div>}
              {project.company && <div><dt>{text.company}</dt><dd>{project.company[locale]}</dd></div>}
              <div>
                <dt>{text.category}</dt>
                <dd>{projectCategoryLabel}</dd>
              </div>
            </dl>

            {project.description[locale]?.length ? (
              <div className="project-description max-w-2xl">
                <h2 className="sr-only">{text.description}</h2>
                <ul className="list-disc space-y-3 ps-5 text-lg leading-relaxed text-foreground/90">
                  {project.description[locale]?.map((paragraph) => <li key={paragraph}>{paragraph}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="project-actions mt-7 flex flex-wrap gap-3">
              {project.previewUrl && (
                <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className="project-action project-action-primary">
                  {text.openProject}<Icon name="external" size={14} />
                </a>
              )}
              {project.sourceUrl && (
                <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="project-action">
                  {text.viewSource}<Icon name="external" size={14} />
                </a>
              )}
            </div>
          </div>
        </section>

        <section aria-label={locale === "ar" ? "مشاريع أخرى" : "Other projects"} className="project-navigation border-t px-6 py-12">
          <div className="flex items-center justify-between gap-4">
            {previousProject ? (
              <Link href={`/${locale}/project/${previousProject.slug}`} className="project-neighbor group flex items-center gap-3 transition-opacity hover:opacity-70">
                <Icon name={locale === "ar" ? "arrow-right" : "arrow-left"} size={18} />
                <span><span className="neighbor-label">{text.previous}</span><span className="neighbor-name">{previousProject.title}</span></span>
              </Link>
            ) : <span />}
            {nextProject ? (
              <Link href={`/${locale}/project/${nextProject.slug}`} className="project-neighbor group flex items-center gap-3 text-end transition-opacity hover:opacity-70">
                <span><span className="neighbor-label">{text.next}</span><span className="neighbor-name">{nextProject.title}</span></span>
                <Icon name={locale === "ar" ? "arrow-left" : "arrow-right"} size={18} />
              </Link>
            ) : <span />}
          </div>
        </section>
      </main>
    </>
  );
}

function ProjectPageFallback() {
  return (
    <main aria-hidden="true" className="min-h-screen bg-background">
      <section className="project-detail-hero px-4 pt-20 sm:px-6">
        <div className="relative h-[40vh] animate-pulse rounded-2xl bg-muted md:h-[80vh] md:rounded-3xl" />
      </section>
      <section className="px-6 py-8">
        <div className="max-w-4xl space-y-5">
          <div className="h-14 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </section>
    </main>
  );
}
