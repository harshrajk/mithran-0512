import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Trophy, Sparkles, Plus } from "lucide-react";
import { Badge } from "../../components/ui/badge";

type List = {
  id: string;
  title: string;
  category: string;
};

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

export default function Home() {
  const [lists, setLists] = useState<List[]>([]);

  // Fetch lists from server
  useEffect(() => {
    fetch("/api/lists")
      .then((res) => res.json())
      .then((data) => setLists(data))
      .catch((err) => console.error("Error fetching lists:", err));
  }, []);

  const getCategoryGradient = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.gradient : 'from-gray-500 to-slate-500';
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : '✨ Other';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Top 10 Lists
            </h1>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          
          <Link to="/new">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-5 h-5 mr-2" />
              New List
            </Button>
          </Link>
        </div>

        {lists.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Sparkles className="w-12 h-12 mx-auto text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No lists yet</h3>
              <p className="text-gray-500 mb-6">Create your first top 10 list to get started!</p>
              <Link to="/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create List
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Link to={`/list/${list.id}`} key={list.id} className="group">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-gray-800 line-clamp-2">
                      {list.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className={`bg-gradient-to-r ${getCategoryGradient(list.category)} text-white`}>
                        {getCategoryLabel(list.category)}
                      </Badge>
                      <span className="text-sm text-blue-600 group-hover:underline">View →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}