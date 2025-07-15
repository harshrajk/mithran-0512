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
    const items = form.getAll("items[]").map(item => JSON.parse(item as string));
    const images = form.getAll("images[]"); // Array of File objects

    const finalItems: any[] = [];

    // 🔁 Correctly await each image upload
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const image = images[index];
        let imageUrl = item.image_url ?? null;

        if (image instanceof File && image.size > 0) {
            const key = `lists/${Date.now()}_${index}_${image.name}`;
            const buffer = await image.arrayBuffer();

            try {
                await c.env.MITH_BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: image.type }
                });

                imageUrl = `https://assets.decalist.xyz/${key}`;
                console.log("✅ File uploaded successfully:", imageUrl);
            } catch (error) {
                console.error("❌ Error uploading to R2:", error);
            }
        } else {
            console.log(`⚠️ No file uploaded for item ${index + 1}, using image_url: ${imageUrl}`);
        }

        // Build final item with resolved image URL
        finalItems.push({
            title: item.title ?? "",
            description: item.description ?? "",
            position: item.position ?? 0,
            image_url: imageUrl,
            external_url: item.external_url ?? null,
        });
    }

    // ✅ Insert list
    const result = await c.env.MITH_DB
        .prepare("INSERT INTO lists (title, category, user_id) VALUES (?, ?, ?)")
        .bind(title, category, 1)
        .run();

    const listId = result.meta.last_row_id;

    // ✅ Insert list items with proper image_url
    for (const item of finalItems) {
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

    return c.json({ message: "✅ List created successfully", id: listId });
});

export default app;
