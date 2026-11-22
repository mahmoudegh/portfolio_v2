export function DownloadCvRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="1;url=/cv-file" />
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p>
          Your download should start shortly. If it doesn’t,<br />
          <a className="underline" href="/cv-file">download mahmoud_galal_frontend_web_developer_cv</a>.
        </p>
      </main>
    </>
  );
}
