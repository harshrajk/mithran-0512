import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type List = {
  id: string;
  title: string;
  category: string;

};

export default function Home() {

  const [lists, setLists] = useState<List[]>([]);

  // Fetch lists from server
  useEffect(() => {
    fetch("/api/lists")
      .then((res) => res.json())
      .then((data) => setLists(data))
      .catch((err) => console.error("Error fetching lists:", err));
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 align-items-center bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">📋 My Top 10 Lists</h1>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            ➕ New List
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{list.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{list.category}</p>
              <Link
                to={`/list/${list.id}`}
                className="text-sm mt-3 inline-block text-blue-600 hover:underline"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
