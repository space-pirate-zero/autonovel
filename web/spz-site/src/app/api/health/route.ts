export function GET() {
  return Response.json({
    status: "ok",
    site: "spz",
    timestamp: Date.now(),
  });
}
