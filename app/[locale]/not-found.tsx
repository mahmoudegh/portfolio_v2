import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <h1 className="font-display text-6xl">404</h1>
      <p>Page not found</p>
      <Link href="/en" className="text-muted-foreground underline underline-offset-4">Back to work</Link>
    </main>
  );
}
