"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import UserProfile from "@/components/user-profile/UserProfile";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  image_url?: string;
  created_at: string;
}

const ViewPost = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Fetch posts and categories from Node backend
  useEffect(() => {
    const fetchPostsAndCategories = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/posts`);
        const postsData: Post[] = await res.json();
        setPosts(postsData || []);

        // Extract unique categories
        const uniqueCategories = ["All", ...new Set(postsData.map((p) => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndCategories();
  }, []);

  const openDeleteModal = (postId: number) => {
    setSelectedPostId(postId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPostId(null);
  };

  const handleDelete = async () => {
    if (!selectedPostId) return;

    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/posts/${selectedPostId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== selectedPostId));
      } else {
        const err = await res.json();
        console.error("Failed to delete post:", err.message);
        alert("Failed to delete post: " + err.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    }

    closeModal();
  };

  if (loading) return <div className="text-center text-lg font-semibold mt-20">Loading posts...</div>;

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <div className="max-w-full w-full">
      <header className="header">
        <h1 className="text-xl font-semibold">Manage Blog</h1>
        <div className="ml-auto">
          <UserProfile user={null} />
        </div>
      </header>

      <div className="pt-20 ml-64 px-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-4">Blog Posts</h1>

        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition ${activeCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <p className="text-gray-500 mt-4">No posts found.</p>
        ) : (
          <div className="space-y-6 mt-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="card p-4 relative">
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={1200}
                    height={360}
                    sizes="100vw"
                    className="w-full h-60 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-2xl font-semibold">{post.title}</h2>
                <p className="text-gray-600">{post.content}</p>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>
                    Category: <strong>{post.category}</strong>
                  </span>
                  <span>By: {post.author}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => openDeleteModal(post.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold">Confirm Delete</h2>
            <p className="text-gray-600 mt-2">Are you sure you want to delete this post?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPost;
