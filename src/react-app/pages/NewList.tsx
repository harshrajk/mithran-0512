import React, { useState } from "react";

type ListItem = {
    id: string;
    position: number;
    title: string;
    description: string;
    imageFile?: File;
    imageUrl?: string;
    externalUrl: string;
};

export default function NewList() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [otherSelection, setOtherSelection] = useState(false);
    const [items, setItems] = useState<ListItem[]>(
        Array.from({ length: 10 }, (_, i) => ({
            id: `item-${i + 1}`,
            position: i + 1,
            title: "",
            description: "",
            imageUrl: "",
            externalUrl: "",
        }))
    );

    const handleItemChange = (index: number, field: keyof ListItem, value: any) => {
        const updated = [...items];
        (updated[index] as any)[field] = value;
        setItems(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        items.forEach((item) => {
            formData.append("items[]", JSON.stringify(item));
            if (item.imageFile) {
                formData.append("images", item.imageFile);
            }
        });
        // TODO: Upload files and send full payload to backend
        // Make post request to /api/new with the list data + image file uploaded   
        fetch("/api/new", {
            method: "POST",
            body: formData
        }).then((response) => {
            if (response.ok) {
                console.log("List created successfully!");
            } else {
                console.error("Failed to create list");
            }
        })
            .then((data) => {
                console.log("Response data:", data);
            })
            .catch((error) => {
                console.error("Error creating list:", error);
            });
    };

    const manageSetCategory = (value: string) => {
        if (value === "other") {
            setOtherSelection(true);
        } else {
            setCategory(value);
            setOtherSelection(false);
        }
    };

    const setOtherCategory = (value: string) => {
        if(value.trim() === "") return; // Prevent empty category
         // Set other category in lower case and camelCase
        setCategory(value.toLowerCase().replace(/\s+/g, '_'));
        setOtherSelection(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create a New Top 10 List</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="List Title"
                            className="w-full border rounded-md p-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        {/* Category */}
                        <select
                            className="w-full border rounded-md p-2"
                            value={category}
                            onChange={(e) => manageSetCategory(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option value={'movies'}>Movies</option>
                            <option value={'tv_shows'}>TV Shows</option>
                            <option value={'books'}>Books</option>
                            <option value={'destinations'}>Destinations</option>
                            <option value={'goals'}>Goals</option>
                            <option value={'music'}>Music</option>
                            <option value={'games'}>Games</option>
                            <option value={'food'}>Food</option>
                            <option value={'hobbies'}>Hobbies</option>
                            <option value={'other'}>Other</option>
                        </select>
                    </div>

                    {
                        otherSelection && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Other Category"
                                    className="w-full border rounded-md p-2"
                                    value={category}
                                    onChange={(e) => setOtherCategory(e.target.value)}
                                />  
                            </div>
                        )
                    }

                    {/* List Items */}
                    <div className="space-y-4">
                        <h2>List Items!</h2>
                        {items.map((item, i) => (
                            <div key={item.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                                <details open className="group">
                                    <summary className="cursor-pointer flex justify-between items-center font-semibold text-gray-800">
                                        #{i + 1}: {item.title || "Untitled"}
                                    </summary>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            className="border rounded p-2"
                                            value={item.title}
                                            onChange={(e) => handleItemChange(i, "title", e.target.value)}
                                        />

                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            placeholder="Position (1-10)"
                                            className="border rounded p-2"
                                            value={item.position}
                                            onChange={(e) =>
                                                handleItemChange(i, "position", Number(e.target.value))
                                            }
                                        />

                                        <textarea
                                            placeholder="Description"
                                            className="sm:col-span-2 border rounded p-2 resize-y"
                                            rows={2}
                                            value={item.description}
                                            onChange={(e) => handleItemChange(i, "description", e.target.value)}
                                        />

                                        <input
                                            type="url"
                                            placeholder="External URL"
                                            className="border rounded p-2"
                                            value={item.externalUrl}
                                            onChange={(e) => handleItemChange(i, "externalUrl", e.target.value)}
                                        />

                                        <input
                                            type="url"
                                            placeholder="Image URL"
                                            className="border rounded p-2"
                                            value={item.imageUrl}
                                            onChange={(e) => handleItemChange(i, "imageUrl", e.target.value)}
                                        />

                                        <div className="sm:col-span-2">
                                            <label className="text-sm text-gray-500">Upload Image (optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="mt-1 block w-full text-sm text-gray-600"
                                                onChange={(e) =>
                                                    handleItemChange(i, "imageFile", e.target.files?.[0])
                                                }
                                            />
                                        </div>

                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        🚀 Save List
                    </button>
                </form>
            </div>
        </div>
    );
}
