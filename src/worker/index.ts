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
    const items = form.getAll('items[]').map(item => JSON.parse(item as string));
    const images = form.getAll('images[]'); // Array of File objects (Blob)

    const finalItems : any[] = [];

    items.forEach(async (item, index) => {
        
        const image = images[index];

        if (image instanceof File && image.size > 0) {
            const key = `lists/${Date.now()}_${index}_${image.name}`;
            const buffer = await image.arrayBuffer();
            try {
                await c.env.MITH_BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: image.type }
                });
            } catch (error) {
                console.error("Error uploading file to R2:", error);
            }
            item.imageUrl = `https://assets.decalist.xyz/${key}`; // Replace with your actual R2 public URL
        } else {
            console.log(`No file uploaded for item ${index + 1}, using provided imageUrl: ${item.image_url}`);
        }

        finalItems.push({
            title: item.title,
            description: item.description,
            position : item.position,
            image_url: item.imageUrl || item.image_url, // Use the uploaded image URL or the provided one
            external_url: item.externalUrl
        });
        
    });

   

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
