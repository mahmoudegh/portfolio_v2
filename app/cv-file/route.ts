import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const filePath = join(process.cwd(), "public", "files", "mahmoud_galal_frontend_web_developer_cv.pdf");
  const pdf = await readFile(filePath);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Disposition": 'attachment; filename="mahmoud_galal_frontend_web_developer_cv.pdf"',
      "Content-Length": String(pdf.byteLength),
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
