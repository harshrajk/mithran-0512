import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.post("/api/new", async (c) => {
    let body = await c.req.parseBody();
    console.log("New request received",body);
    return c.json({ message: "New endpoint" });
})

export default app;
