import React, { useEffect, useState, useCallback } from "react";
import PostCard from "../../components/Posts/PostCard";
import CreatePost from "../../components/Posts/CreatePost";
import { api } from "../../api/apiClient";

/**
 * يحوّل أي Response للفيد إلى كائن pagination موحد:
 *  - paginate object: { data: [], current_page, last_page, ... }
 *  - أو مغلف: { posts: paginateObject }
 *  - أو مغلف: { data: paginateObject }
 */
function normalizePaginatedResponse(res) {
  if (!res) return { data: [], current_page: 1, last_page: 1 };

  // أشهر حالات التغليف
  if (res?.posts?.data) return res.posts;     // { posts: { data: [...] } }
  if (res?.data?.data) return res.data;       // { data: { data: [...] } }

  // إذا رجع paginate مباشرة
  if (Array.isArray(res?.data) && "current_page" in res) return res; // نادر

  // إذا رجع paginate بالشكل الطبيعي
  if (Array.isArray(res?.data) && (res?.current_page || res?.last_page)) return res;

  // إذا رجع object فيه data فقط (بدون paginate metadata)
  if (Array.isArray(res?.data)) {
    return { data: res.data, current_page: 1, last_page: 1 };
  }

  // fallback
  return { data: [], current_page: 1, last_page: 1 };
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadPosts = useCallback(async (pageToLoad = 1, mode = "replace") => {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      setError("");

      const res = await api.feedPosts(pageToLoad);

      const paginated = normalizePaginatedResponse(res);
      const data = Array.isArray(paginated?.data) ? paginated.data : [];

      if (mode === "replace") {
        setPosts(data);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          for (const p of data) {
            if (!existingIds.has(p.id)) merged.push(p);
          }
          return merged;
        });
      }

      const current = Number(paginated?.current_page || pageToLoad || 1);
      const last = Number(paginated?.last_page || current || 1);

      setPage(current);
      setHasMore(current < last);
    } catch (e) {
      const msg = e?.message || "فشل تحميل المنشورات";
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1, "replace");
  }, [loadPosts]);

  const handleCreated = (created) => {
    // يدعم أن CreatePost يرجع post مباشرة أو يرجع { post: ... }
    const createdPost = created?.post || created;
    if (!createdPost) return;

    setPosts((prev) => {
      // منع التكرار إذا البوست موجود
      if (prev.some((p) => p.id === createdPost.id)) return prev;
      return [createdPost, ...prev];
    });
  };

  const refreshFeed = () => loadPosts(1, "replace");

  return (
    <div className="min-h-screen bg-fivethColor dark:bg-[#101828] py-10 px-4 transition-colors duration-500">
      <div className="max-w-xl mx-auto space-y-8">
        {/* CreatePost */}
        <CreatePost onCreated={handleCreated} />

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-5 text-center font-bold text-mainColor shadow">
            جارٍ تحميل المنشورات...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-white rounded-2xl p-5 text-center shadow">
            <p className="font-bold text-danger mb-3">{error}</p>
            <button
              onClick={() => loadPosts(1, "replace")}
              className="bg-mainColor text-white px-5 py-2 rounded-full font-bold hover:opacity-90"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-white rounded-2xl p-6 text-center shadow">
            <p className="font-bold text-sevenColor">
              لا يوجد منشورات بعد. كن أول من ينشر 🐾
            </p>
          </div>
        )}

        {/* Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            comments={post.comments || []}
            refreshFeed={refreshFeed}
          />
        ))}

        {/* Load More */}
        {!loading && !error && hasMore && (
          <div className="flex justify-center pb-10">
            <button
              onClick={() => loadPosts(page + 1, "append")}
              disabled={loadingMore}
              className="bg-mainColor text-white px-6 py-3 rounded-full font-black hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingMore ? "جارٍ التحميل..." : "تحميل المزيد"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}