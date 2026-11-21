"use client";

import { useEffect } from "react";
import Link from "next/link";

export function DownloadCvRedirect() {
  useEffect(() => {
    window.location.replace("/cv-file");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p>
        Your download should start shortly. If it doesn’t, <Link className="underline" href="/cv-file">download the CV</Link>.
      </p>
    </main>
  );
}
