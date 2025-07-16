import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { Separator } from '../../components/ui/separator';
import { AlertCircle, ChevronDown, ChevronUp, Image, Link, Plus, Sparkles, Trophy, Upload } from 'lucide-react';

type ListItem = {
    id: string;
    position: number;
    title: string;
    description: string;
    imageFile?: File;
    imageUrl?: string;
    externalUrl: string;
};

export default function CreativeTop10Creator() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [otherSelection, setOtherSelection] = useState(false);
    const [items, setItems] = useState<ListItem[]>(
        Array.from({ length: 3 }, (_, i) => ({
            id: `item-${i + 1}`,
            position: i + 1,
            title: "",
            description: "",
            imageUrl: "",
            externalUrl: "",
        }))
    );
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

    const categories = [
        { value: 'movies', label: '🎬 Movies', gradient: 'from-red-500 to-pink-500' },
        { value: 'tv_shows', label: '📺 TV Shows', gradient: 'from-blue-500 to-purple-500' },
        { value: 'books', label: '📚 Books', gradient: 'from-green-500 to-teal-500' },
        { value: 'destinations', label: '🌍 Destinations', gradient: 'from-orange-500 to-red-500' },
        { value: 'goals', label: '🎯 Goals', gradient: 'from-purple-500 to-indigo-500' },
        { value: 'music', label: '🎵 Music', gradient: 'from-pink-500 to-rose-500' },
        { value: 'games', label: '🎮 Games', gradient: 'from-indigo-500 to-blue-500' },
        { value: 'food', label: '🍕 Food', gradient: 'from-yellow-500 to-orange-500' },
        { value: 'hobbies', label: '🎨 Hobbies', gradient: 'from-teal-500 to-cyan-500' },
        { value: 'other', label: '✨ Other', gradient: 'from-gray-500 to-slate-500' }
    ];

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
            const { id, title, description, position, externalUrl, imageUrl } = item;
            const imageFile = item.imageFile;

            const itemPayload = {
                id,
                title,
                description,
                position,
                imageUrl,
                externalUrl
            };

            formData.append('items[]', JSON.stringify(itemPayload));

            if (imageFile instanceof File) {
                formData.append('images[]', imageFile);
            }
        });

        // Simulated API call
        console.log("Submitting form data:", formData);
        alert("List created successfully! (This is a demo)");
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
        if (value.trim() === "") return;
        setCategory(value.toLowerCase().replace(/\s+/g, '_'));
        setOtherSelection(false);
    };

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const selectedCategory = categories.find(cat => cat.value === category);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Top 10 List Creator
                        </h1>
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-gray-600 text-lg">Create your ultimate ranked list with style</p>
                </div>

                <div onSubmit={handleSubmit} className="space-y-6">
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Category</Label>
                                    <Select value={category} onValueChange={manageSetCategory}>
                                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Choose a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {otherSelection && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Custom Category</Label>
                                    <Input
                                        placeholder="Enter your custom category"
                                        value={category}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherCategory(e.target.value)}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {selectedCategory && (
                                <div className="flex items-center gap-2 pt-2">
                                    <Badge variant="secondary" className={`bg-gradient-to-r ${selectedCategory.gradient} text-white`}>
                                        {selectedCategory.label}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Your Top 10 Items
                            </CardTitle>
                            <CardDescription>Add details for each item in your list</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <Card key={item.id} className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                    <Collapsible open={openItems.has(index)} onOpenChange={() => toggleItem(index)}>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">
                                                                {item.title || "Untitled Item"}
                                                            </CardTitle>
                                                            {item.description && (
                                                                <CardDescription className="text-sm line-clamp-1">
                                                                    {item.description}
                                                                </CardDescription>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {openItems.has(index) ? 
                                                        <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                    }
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 space-y-4">
                                                <Separator />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                            Title
                                                        </Label>
                                                        <Input
                                                            placeholder="Item title"
                                                            value={item.title}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "title", e.target.value)}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                            Position (1-10)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={10}
                                                            value={item.position}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "position", Number(e.target.value))}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                            Description
                                                        </Label>
                                                        <Textarea
                                                            placeholder="Why does this item deserve its ranking?"
                                                            value={item.description}
                                                            onChange={(e: any) => handleItemChange(index, "description", e.target.value)}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <Link className="w-3 h-3" />
                                                            External URL
                                                        </Label>
                                                        <Input
                                                            type="url"
                                                            placeholder="https://example.com"
                                                            value={item.externalUrl}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "externalUrl", e.target.value)}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <Image className="w-3 h-3" />
                                                            Image URL
                                                        </Label>
                                                        <Input
                                                            type="url"
                                                            placeholder="https://example.com/image.jpg"
                                                            value={item.imageUrl}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "imageUrl", e.target.value)}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <Upload className="w-3 h-3" />
                                                            Upload Image (Optional)
                                                        </Label>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "imageFile", e.target.files?.[0])}
                                                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 file:bg-purple-50 file:text-purple-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            onClick={handleSubmit}
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create Amazing List
                            <Trophy className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}