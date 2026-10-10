// Fallback for requests that never reach a language route (the language layout renders the normal 404).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ background: "#0b0b0c", color: "#f4f4f2", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <p>
          Off the track. <a href="/" style={{ color: "inherit" }}>Back to the start</a>
        </p>
      </body>
    </html>
  );
}
