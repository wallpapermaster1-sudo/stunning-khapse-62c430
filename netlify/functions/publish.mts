import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = Netlify.env.get("NETLIFY_AUTH_TOKEN");
  const siteId = context.site.id || Netlify.env.get("SITE_ID");

  if (!token || !siteId) {
    return new Response(
      JSON.stringify({ error: "Server configuration missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/builds`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return new Response(
      JSON.stringify({ error: "Deploy trigger failed", detail: text }),
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await res.json();
  return Response.json({
    success: true,
    message: "Deploy triggered",
    deployId: data.id || data.deploy_id,
  });
};

export const config: Config = {
  path: "/api/publish",
  method: "POST",
};
