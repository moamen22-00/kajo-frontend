// src/components/Posts/Comment.jsx
import React, { useMemo, useState, useEffect } from "react";
import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Comment({ comment, refreshFeed }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const commentId = comment?.id;

  const authorName =
    comment?.user?.name ||
    comment?.author?.name ||
    comment?.userName ||
    "user";

  const content = comment?.text ?? comment?.content ?? "";

  // ✅ الباك عم يرجع avatar_url فيه ?v= جاهز
  const avatarUrlFromApi = comment?.user?.avatar_url || "";

  const finalAvatarSrc = avatarUrlFromApi || DEFAULT_AVATAR;

  // ✅ نخليها state لنتعامل مع onError
  const [imgSrc, setImgSrc] = useState(finalAvatarSrc);

  // ✅ أي تغيير بالتعليق/الرابط → حدّث الصورة
  useEffect(() => {
    setImgSrc(finalAvatarSrc);
  }, [finalAvatarSrc]);

  const isAdmin = useMemo(() => Number(user?.role) === 1, [user?.role]);

  const handleDelete = async () => {
    if (!isAdmin || !commentId) return;

    const ok = window.confirm("حذف التعليق؟");
    if (!ok) return;

    try {
      setBusy(true);
      await api.adminDeleteComment(commentId);
      refreshFeed?.();
    } catch (e) {
      alert(e?.message || e?.data?.message || "فشل حذف التعليق");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#FFF4C7] rounded-2xl p-3 shadow-inner">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/50 bg-white/30 flex-shrink-0">
          <img
            key={imgSrc}              // ✅ هذا يجبر React يعيد mount للصورة
            src={imgSrc}
            alt="avatar"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgSrc(DEFAULT_AVATAR)}
          />
        </div>

        {/* Content */}
        <div className="text-right w-full">
          <div className="flex items-center justify-between">
            <p className="text-sixColor font-extrabold text-sm">@{authorName}</p>

            {isAdmin && (
              <button
                disabled={busy}
                onClick={handleDelete}
                className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:opacity-90 transition disabled:opacity-60"
              >
                {busy ? "..." : "حذف"}
              </button>
            )}
          </div>

          <p className="text-sixColor/80 text-sm mt-1 leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}