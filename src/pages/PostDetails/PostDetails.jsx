import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../../components/Posts/PostCard";
import { api } from "../../api/apiClient";

export default function PostDetails() {
  const { id } = useParams(); // ✅ لأن الراوتر عندك posts/:id
  const postId = useMemo(() => Number(id), [id]);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    // ✅ تحقق من رقم البوست
    if (!postId || Number.isNaN(postId)) {
      setError("رقم المنشور غير صالح");
      setLoading(false);
      setPost(null);
      setComments([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📌 PostDetails fetching:", {
        postId,
        postUrl: `/api/feed/posts/${postId}`,
        commentsUrl: `/api/feed/posts/${postId}/comments`,
      });

      const [postRes, commentsRes] = await Promise.all([
        api.getPost(postId),
        api.postComments(postId),
      ]);

      // apiClient request() يرجع JSON مباشرة (مش axios)
      const postData = postRes?.post ?? postRes ?? null;
      const commentsData = commentsRes?.comments ?? commentsRes?.data ?? commentsRes ?? [];

      setPost(postData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (e) {
      // ✅ تشخيص واضح
      console.log("❌ PostDetails ERROR:", e);
      console.log("STATUS:", e?.status);
      console.log("DATA:", e?.data);

      const msg =
        e?.data?.message ||
        e?.message ||
        "فشل جلب تفاصيل المنشور";

      setError(msg);
      setPost(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-fivethColor dark:bg-[#101828] py-10 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600 dark:text-gray-300 py-10">
            جاري التحميل...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>

            <button
              onClick={fetchAll}
              className="mt-4 bg-mainColor text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Not found */}
        {!loading && !error && !post && (
          <div className="text-center text-gray-600 dark:text-gray-300 py-10">
            المنشور غير موجود
          </div>
        )}

        {/* Post */}
        {!loading && post && (
          <PostCard post={post} comments={comments} refreshFeed={fetchAll} />
        )}
      </div>
    </div>
  );
}