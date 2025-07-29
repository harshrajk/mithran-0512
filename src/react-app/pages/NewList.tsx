import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { SearchSelect } from '../../components/ui/search-select';
import { Separator } from '../../components/ui/separator';
import { Sparkles, Trophy, X, Search, Plus, HomeIcon } from 'lucide-react';
import { debounce } from '../../lib/utils';
import cats from '../../lib/categories.json'
import { EntityResult, EntitySearchResponse } from '../../lib/searchResultTypes';
import { Link, useNavigate } from "react-router-dom";


type ListItem = {
    id: string;
    position: number;
    title: string;
    description: string;
    imageUrl?: string;
    externalUrl?: string;
};


// Mock search API function - replace with your actual API call
const mockSearchAPI = async (query: string, category: string): Promise<EntitySearchResponse[]> => {
    if (!query) return [];

    // Simulate API delay
    const results = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${category}`);
    const data = await results.json();

    return data.results || [];
};

export default function CreativeTop10Creator() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [items, setItems] = useState<ListItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<EntityResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeEditItem, setActiveEditItem] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const categories: Array<{ value: string, label: string }> = cats.categories;

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string, category: string) => {
            if (!query || !category) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const results: any = await mockSearchAPI(query, category);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(searchQuery, category);
    }, [searchQuery, category, debouncedSearch]);

    const handleAddItem = (result: EntityResult) => {
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            position: items.length + 1,
            title: result.result.name,
            description: result?.result.detailedDescription?.articleBody || result.result.description,
            imageUrl: result?.result.image?.contentUrl || "",
            externalUrl: result?.result.url || ""
        };

        setItems([...items, newItem]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleManualAdd = () => {
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            position: items.length + 1,
            title: searchQuery,
            description: "",
            imageUrl: "",
            externalUrl: ""
        };

        setItems([...items, newItem]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleItemChange = (id: string, field: keyof ListItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handlePositionChange = (id: string, newPosition: number) => {
        // Ensure position is between 1 and 10
        newPosition = Math.max(1, Math.min(10, newPosition));

        // Update all positions
        const updatedItems = [...items];
        const itemIndex = updatedItems.findIndex(item => item.id === id);

        if (itemIndex === -1) return;

        // Swap positions if needed
        const existingItemWithPosition = updatedItems.find(item => item.position === newPosition);
        if (existingItemWithPosition) {
            existingItemWithPosition.position = updatedItems[itemIndex].position;
        }

        updatedItems[itemIndex].position = newPosition;

        // Sort by position
        setItems(updatedItems.sort((a, b) => a.position - b.position));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        let formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);

        items.forEach((item) => {
            const { id, title, description, position, externalUrl, imageUrl } = item;

            // Create item object without imageFile
            const itemPayload = {
                id,
                title,
                description,
                position,
                imageUrl,        // If you're not using external image URL
                externalUrl      // Optional, keep it empty or provide value
            };

            console.log('itemPayload', itemPayload);
            

            formData.append('items[]', JSON.stringify(itemPayload));
        });
        // TODO: Upload files and send full payload to backend
        // Make post request to /api/new with the list data + image file uploaded   
        fetch("/api/new", {
            method: "POST",
            body: formData
        }).then((response) => {
            setSubmitting(false);
            if (response.ok) {
                console.log("List created successfully!");
                // Redirect to home page
                navigate("/");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between text-center mb-8">
                    {/* Home icon */}
                    <Link to="/">
                    <div className="inline-flex items-center justify-center text-white w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                        <HomeIcon className="w-6 h-6" />
                        <span className="sr-only">Home</span>
                    </div>
                    </Link>  

                    <div className="inline-flex items-center gap-2 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Deca(10) List Creator
                        </h1>
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Title and Category Card */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                List Details
                            </CardTitle>
                            <CardDescription>Give your list a catchy title and select a category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">List Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Best Movies of All Time"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Category</Label>

                                    <SearchSelect
                                        options={categories}
                                        placeholder="Select a category"
                                        onValueChange={(value) => {
                                            setCategory(value);
                                            console.log("Selected:", value);
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Items Section */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Add Items to Your List
                            </CardTitle>
                            <CardDescription>
                                {items.length > 0
                                    ? `You've added ${items.length} items (max 10)`
                                    : "Search for items to add to your list"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search and Add Items */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder={`Search for ${category ? category : 'items'} to add...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                            disabled={!category}
                                        />
                                    </div>
                                    {!category && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Please select a category first
                                        </p>
                                    )}
                                </div>

                                {/* Search Results */}
                                {isSearching && (
                                    <div className="text-center py-4">
                                        <p>Searching...</p>
                                    </div>
                                )}

                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Search Results</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {searchResults.map((result, index) => (

                                                <div
                                                    key={result['result']["@id"] || index}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleAddItem(result)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {result?.result.image && (
                                                            <img
                                                                src={result.result.image.contentUrl || ""}
                                                                alt={result.result.name}
                                                                className="w-10 h-10 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{result.result.name}</p>
                                                            {result.result.description && (
                                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                                    {result.result.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Plus className="w-5 h-5 text-purple-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchQuery && searchResults.length === 0 && !isSearching && (
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <p>No results found for "{searchQuery}"</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleManualAdd}
                                        >
                                            Add manually
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Current List Items */}
                            {items.length > 0 && (
                                <div className="space-y-4">
                                    <Separator />
                                    <h3 className="text-sm font-medium">Your List ({items.length}/10)</h3>

                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <Card key={item.id} className="border border-gray-200">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                {item.position}
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-lg">
                                                                    {item.title}
                                                                </CardTitle>
                                                                {item.description && (
                                                                    <CardDescription className="text-sm line-clamp-1">
                                                                        {item.description}
                                                                    </CardDescription>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setActiveEditItem(activeEditItem === item.id ? null : item.id)}
                                                                type={'button'}
                                                            >
                                                                {activeEditItem === item.id ? 'Done' : 'Edit'}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                type="button"
                                                            >
                                                                <X className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                {activeEditItem === item.id && (
                                                    <CardContent className="pt-0 space-y-4">
                                                        <Separator />
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Title</Label>
                                                                <Input
                                                                    value={item.title}
                                                                    onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Position (1-10)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={10}
                                                                    value={item.position}
                                                                    onChange={(e) => handlePositionChange(item.id, parseInt(e.target.value))}
                                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-2 space-y-2">
                                                                <Label className="text-sm font-medium">Description</Label>
                                                                <Textarea
                                                                    value={item.description}
                                                                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
                                                                    rows={3}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Image URL</Label>
                                                                <Input
                                                                    type="url"
                                                                    placeholder="https://example.com/image.jpg"
                                                                    value={item.imageUrl || ""}
                                                                    onChange={(e) => handleItemChange(item.id, "imageUrl", e.target.value)}
                                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">External URL</Label>
                                                                <Input
                                                                    type="url"
                                                                    placeholder="https://example.com"
                                                                    value={item.externalUrl || ""}
                                                                    onChange={(e) => handleItemChange(item.id, "externalUrl", e.target.value)}
                                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={items.length === 0 || submitting}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                            onClick={handleSubmit}
                        >
                            {!submitting ? (<>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create Amazing List
                            <Trophy className="w-5 h-5 ml-2" /></>)
                            : "Creating..."}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}