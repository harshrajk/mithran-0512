import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
    MITH_DB: D1Database;
    MITH_BUCKET: R2Bucket;
    VITE_GAPI_KEY: string;
    VITE_GAPI_BASE_URL: string;
}

interface GoogleSearchResult {
    itemListElement : Object[];
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/lists", async (c) => {
    const result = await c.env.MITH_DB.prepare("SELECT * FROM lists").all();
    return c.json(result.results);
});

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

app.get("/api/search", async (c) => {
    const query = c.req.query("q") || "";
    const type = c.req.query("type") || "all";
    if (!query) {
        return c.json({ results: [] });
    }   

    // User google knowledge graph API to search for entities
    const baseUrl = c.env.VITE_GAPI_BASE_URL || "https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyA43KPQxb0JqDTBd3kv8yj3kb7RDr49mBA&query="; 
    const url = `${baseUrl}${encodeURIComponent(query)}&types=${type}&limit=5&indent=True`;

    try {
        const response = await fetch(url);
        const data : GoogleSearchResult = await response.json();

        return c.json({results : data.itemListElement })
        
    } catch (error) {
        console.log('ERORR', error);
        
        return c.json({error : "Failed to get autocomplete suggestions"}, 500);
    }

});

export default app;
