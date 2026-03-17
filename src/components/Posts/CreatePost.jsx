import React, { useMemo, useRef, useState } from "react";
import { FaChevronCircleDown } from "react-icons/fa";
import { api } from "../../api/apiClient";

export default function CreatePost({ onCreated, onError }) {
  const [postType, setPostType] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const accept = useMemo(() => {
    if (postType === "image") return "image/*";
    if (postType === "video") return "video/*";
    if (postType === "voice") return "audio/*";
    return undefined;
  }, [postType]);

  const resetForm = () => {
    setPostType("");
    setCaption("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    if (!postType || postType === "text") return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const validateBeforeSubmit = () => {
    if (!postType) return "اختر نوع المنشور أولاً";

    if (postType === "text") {
      if (!caption.trim()) return "اكتب نص المنشور";
      return null;
    }

    // image/video/voice
    if (!file) return "اختر ملف قبل النشر";
    // الكابشن اختياري بس الأفضل نخليه مسموح فاضي
    return null;
  };

  const handleSubmit = async () => {
    const err = validateBeforeSubmit();
    if (err) {
      onError?.(err);
      alert(err);
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      // تحويل voice -> audio للباك
      const backendType = postType === "voice" ? "audio" : postType;

      fd.append("type", backendType);
      if (caption.trim()) fd.append("text", caption.trim());
      if (file) fd.append("media", file);

      const res = await api.createPost(fd);
      const createdPost = res?.post || res?.data?.post || res?.data;

      if (createdPost) {
        onCreated?.(createdPost);
      }

      resetForm();
    } catch (e) {
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        "فشل إنشاء المنشور";

      onError?.(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[45px] p-8 mb-10 max-w-120 mx-auto shadow-2xl border border-orange-50">
      <h2 className="text-mainColor text-center text-3xl font-black mb-6">
        إنشاء منشور
      </h2>

      {/* Post Type Selector */}
      <div className="relative mb-6">
        <select
          value={postType}
          onChange={(e) => {
            const nextType = e.target.value;
            setPostType(nextType);
            // لما نغير النوع: نمسح الملف السابق
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="w-full appearance-none bg-mainColor text-white py-3 px-6 rounded-full font-bold text-center outline-none cursor-pointer text-lg"
        >
          <option value="">اختيار نوع المنشور</option>
          <option value="text">نص</option>
          <option value="image">صورة وكابشن</option>
          <option value="voice">صوت وكابشن</option>
          <option value="video">فيديو وكابشن</option>
        </select>
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <FaChevronCircleDown className="text-white text-2xl" />
        </div>
      </div>

      {postType !== "" && (
        <div className="space-y-4 animate-appearance-in">
          {/* File Upload Section */}
          {postType !== "text" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
              />

              <div
                onClick={handleUploadClick}
                className="bg-mainColor/10 border-2 border-dashed border-mainColor rounded-[25px] p-6 text-center cursor-pointer hover:bg-mainColor/20 transition"
              >
                <p className="text-mainColor font-black">
                  {file
                    ? `تم اختيار: ${file.name}`
                    : `انقر لرفع ${
                        postType === "image"
                          ? "الصورة"
                          : postType === "video"
                          ? "الفيديو"
                          : "الملف الصوتي"
                      } 🐾`}
                </p>
                <span className="text-xs text-mainColor/60 italic">
                  {file ? "(اضغط لتغيير الملف)" : "(سيتم اختيار الملف من جهازك)"}
                </span>
              </div>
            </>
          )}

          <div className="bg-fivethColor rounded-[35px] p-6 min-h-37.5 shadow-inner">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={
                postType === "text" ? "انقر لإضافة نص" : "أضف كابشن للمنشور..."
              }
              className="bg-transparent w-full h-full text-right outline-none text-sevenColor font-bold placeholder-sevenColor/50 resize-none"
              rows={4}
              disabled={submitting}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-fivethColor text-mainColor py-3 rounded-full font-black text-xl hover:bg-[#ffe894] transition shadow-md border border-mainColor/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "جارٍ النشر..." : "إضافة منشور"}
          </button>
        </div>
      )}
    </div>
  );
}