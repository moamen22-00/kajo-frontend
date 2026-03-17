import React, { useEffect, useState } from "react";
import PostCard from "../../components/Posts/PostCard";
import { FaBookmark } from "react-icons/fa";
import { api } from "../../api/apiClient";

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.savedPosts();
      setSavedPosts(res?.posts || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل المحفوظات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPosts();
  }, []);

  return (
    <div
      className="w-full min-h-screen bg-white dark:bg-[#101828] p-6 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto pt-10">
        <div className="flex items-center gap-4 mb-10 border-b-2 border-dotted border-mainColor dark:border-fourthColor pb-6">
          <div className="bg-mainColor dark:bg-fourthColor p-4 rounded-2xl text-white dark:text-mainColor text-3xl shadow-lg">
            <FaBookmark />
          </div>
          <div>
            <h1 className="text-mainColor dark:text-white text-4xl font-black italic">
              العناصر المحفوظة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              كل المنشورات التي قمت بحفظها للرجوع إليها لاحقاً
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl p-6 text-center shadow font-bold text-mainColor">
            جاري تحميل المحفوظات...
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 rounded-2xl p-6 text-center font-bold">
            {error}
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="space-y-8">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                comments={post.comments || []}
                refreshFeed={loadSavedPosts}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-2xl italic">
              لا يوجد عناصر محفوظة حالياً.. 🐾
            </p>
          </div>
        )}
      </div>
    </div>
  );
}