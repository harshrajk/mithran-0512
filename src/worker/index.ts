import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
    MITH_DB: D1Database;
    MITH_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.post("/api/new", async (c) => {
    const form = await c.req.formData();

    const title = form.get("title")?.toString() || "";
    const category = form.get("category")?.toString() || "";
    const items: any[] = [];

    // Collect list items
    for (let i = 0; i < 3; i++) {
        const prefix = `items[${i}]`;

        const title = form.get(`${prefix}[title]`)?.toString() ?? "";
        const description = form.get(`${prefix}[description]`)?.toString() ?? "";
        const imageUrl = form.get(`${prefix}[imageUrl]`)?.toString() ?? "";
        const externalUrl = form.get(`${prefix}[externalUrl]`)?.toString() ?? "";
        const position = parseInt(form.get(`${prefix}[position]`)?.toString() ?? `${i + 1}`);

        const file = form.get(`${prefix}[imageFile]`);

        let finalImageUrl = imageUrl;

        if (file instanceof File && file.size > 0) {
            const key = `lists/${Date.now()}_${i}_${file.name}`;
            const buffer = await file.arrayBuffer();
            try {
                await c.env.MITH_BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: file.type }
                });
            } catch (error) {
                console.error("Error uploading file to R2:", error);
            }
            finalImageUrl = `https://assets.decalist.xyz/${key}`; // Replace with your actual R2 public URL
        } else {
            console.log(`No file uploaded for item ${i + 1}, using provided imageUrl: ${imageUrl}`);
        }

        items.push({
            title,
            description,
            position,
            image_url: finalImageUrl,
            external_url: externalUrl
        });
    }

    // Insert into `lists` table
    const result = await c.env.MITH_DB
        .prepare("INSERT INTO lists (title, category, user_id) VALUES (?, ?, ?)")
        .bind(title, category, 1)
        .run();

    const listId = result.meta.last_row_id;

    // Insert each list item
    for (const item of items) {
        await c.env.MITH_DB.prepare(`
                INSERT INTO list_items 
                (list_id, position, title, description, image_url, external_url)
                VALUES (?, ?, ?, ?, ?, ?)
                `)
            .bind(
                listId,
                item.position,
                item.title,
                item.description,
                item.image_url,
                item.external_url
            )
            .run();
    }

    return c.json({ message: "List created successfully", id: listId });
})

export default app;
