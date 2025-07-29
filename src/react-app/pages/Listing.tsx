import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Trophy, Sparkles, ChevronUp, ChevronDown, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import categories from "../../lib/categories.json"; // Assuming categories is exported from this file

type ListItem = {
    id: string;
    position: number;
    title: string;
    description: string;
    image_url?: string;
    external_url?: string;
};

type ListDetails = {
    id: string;
    title: string;
    category: string;
    items: ListItem[];
    created_at: string;
};

const cats = categories.categories;

export default function Listing() {
    const { id } = useParams();
    const [list, setList] = useState<ListDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    // Fetch list details from server
    useEffect(() => {
        setLoading(true);
        fetch(`/api/lists/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setList(data);
                // Expand the top 3 items by default
                const defaultExpanded = new Set([0, 1, 2]);
                setExpandedItems(defaultExpanded);
            })
            .catch((err) => console.error("Error fetching list:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const toggleItemExpansion = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    const getCategoryLabel = (categoryValue: string) => {
        const category = cats.find(cat => cat.value === categoryValue);
        return category ? category.label : '✨ Other';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64 mx-auto" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3 mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
                <div className="max-w-4xl mx-auto text-center py-12">
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="py-8">
                            <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">List Not Found</h2>
                            <p className="text-gray-600 mb-6">The list you're looking for doesn't exist or may have been removed.</p>
                            <Link to="/">
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                    Back to Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {list.title}
                        </h1>
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                        <Badge variant="secondary" className={`bg-gradient-to-r from-gray-500 to-slate-500 text-white`}>
                            {getCategoryLabel(list.category)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                            Created on {new Date(list.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <Link to="/">
                        <Button variant="outline" className="border-gray-300">
                            ← Back to My Lists
                        </Button>
                    </Link>
                </div>

                {/* List Items */}
                <div className="space-y-4">
                    {list.items.sort((a, b) => a.position - b.position).map((item, index) => (
                        <Card key={item.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                            <div
                                className={`cursor-pointer transition-colors ${expandedItems.has(index) ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleItemExpansion(index)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                            {item.position}
                                        </div>
                                        <div className="flex-grow">
                                            <CardTitle className="text-xl">{item.title}</CardTitle>
                                            {item.description && (
                                                <CardDescription className={`${expandedItems.has(index) ? 'line-clamp-1' : 'line-clamp-2'} mt-1`}>
                                                    {item.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 text-gray-400">
                                            {expandedItems.has(index) ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </div>

                            {expandedItems.has(index) && (
                                <CardContent className="pt-0 pb-6">
                                    <Separator className="mb-4" />
                                    <>
                                        <div className="flex gap-2">
                                            {item.image_url && (
                                                <div className="mb-4 rounded-lg overflow-hidden">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        className="w-auto h-auto max-h-64 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                            {item.description && (
                                                <div className="prose max-w-none text-gray-700 mb-4">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    </>

                                    <div className="space-y-3">
                                        {(item.external_url || item.image_url) && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {item.external_url && (
                                                    <a
                                                        href={item.external_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                        External Link
                                                    </a>
                                                )}
                                                {item.image_url && (
                                                    <a
                                                        href={item.image_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                    >
                                                        <ImageIcon className="w-4 h-4" size={'small'} />
                                                        Image Source
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="text-center mt-12 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Inspired to create your own list?</h3>
                    <Link to="/new">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create Your Own Top 10 List
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}