export function GET() {
  return Response.json({
    status: "ok",
    site: "sa9-website",
    timestamp: Date.now(),
  });
}
