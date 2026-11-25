import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@/src/data/site";

type CvDocumentData = { styles: string; content: string };

const cvDocuments: Record<Locale, CvDocumentData> = {
  ar: readCvDocument("mahmoud_galal_cv_ar.html"),
  en: readCvDocument("mahmoud_galal_cv_en.html"),
};

function readCvDocument(filename: string): CvDocumentData {
  const html = readFileSync(join(process.cwd(), "public", "files", filename), "utf8");
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join("\n");
  const content = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];

  if (!styles || !content) {
    throw new Error(`CV document ${filename} is missing its stylesheet or main content.`);
  }

  return {
    styles: `${scopeStyles(styles)}\n.cv-document {background:var(--background);}\n.cv-document .page {margin-block-start:0;}\n.cv-document, .cv-document * {-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}`,
    content,
  };
}

function scopeStyles(styles: string): string {
  function transformRules(css: string): string {
    let output = "";
    let cursor = 0;

    while (cursor < css.length) {
      const openBrace = css.indexOf("{", cursor);
      if (openBrace === -1) {
        output += css.slice(cursor);
        break;
      }

      const prelude = css.slice(cursor, openBrace);
      let depth = 1;
      let closeBrace = openBrace + 1;
      while (closeBrace < css.length && depth > 0) {
        if (css[closeBrace] === "{") depth += 1;
        if (css[closeBrace] === "}") depth -= 1;
        closeBrace += 1;
      }

      const body = css.slice(openBrace + 1, closeBrace - 1);
      const trimmedPrelude = prelude.trim();
      if (/^@(media|supports|container|layer)\b/i.test(trimmedPrelude)) {
        output += `${prelude}{${transformRules(body)}}`;
      } else if (trimmedPrelude.startsWith("@")) {
        output += `${prelude}{${body}}`;
      } else {
        const scoped = trimmedPrelude
          .split(",")
          .map((selector) => {
            const value = selector.trim();
            if ([":root", "html", "body"].includes(value)) return ".cv-document";
            if (value === "*") return ".cv-document *";
            return `.cv-document ${value}`;
          })
          .join(",");
        output += `${scoped}{${body}}`;
      }
      cursor = closeBrace;
    }

    return output;
  }

  return transformRules(styles);
}

export function CvDocument({ locale }: { locale: Locale }) {
  const document = cvDocuments[locale];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: document.styles }} />
      <div
        className="cv-document"
        lang={locale}
        dir={locale === "ar" ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: document.content }}
      />
    </>
  );
}
