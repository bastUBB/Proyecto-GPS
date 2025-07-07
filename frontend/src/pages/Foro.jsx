import { useState } from "react";
import PagGeneral from "../components/PagGeneral";

export default function Foro() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosts([{ id: Date.now(), text: newPost, date: new Date() }, ...posts]);
    setNewPost("");
  };

  const handleDelete = (id) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  const handleEdit = (post) => {
    setEditPostId(post.id);
    setEditText(post.text);
  };

  const handleSave = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, text: editText } : post
      )
    );
    setEditPostId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setEditText("");
  };

  return (
    <PagGeneral>
    <div className="min-h-screen p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">
          Publicaciones
        </h1>

        {/* Formulario */}
        <form onSubmit={handlePost} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Escribe tu publicación aquí..."
          />
          <button
            type="submit"
            className="mt-2 bg-[#123a68] text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Publicar
          </button>
        </form>

        {/* Lista de publicaciones */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center">Aún no hay publicaciones.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                {editPostId === post.id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 rounded border border-gray-300 mb-2"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(post.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800">{post.text}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-400">
                        {post.date.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="bg-[#123a68] text-white hover:underline hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                          <img 
                            src="/IconEditar.png" 
                            alt="Editar"
                            className="h-4 w-4"
                          />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="bg-[#123a68] text-white hover:underline hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                          <img 
                          src="/IconEliminar.png"
                          alt="Eliminar" 
                          className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </PagGeneral>
  );
}
