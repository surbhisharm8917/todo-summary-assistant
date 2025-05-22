import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error("Failed to fetch todos");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!text) return;
    try {
      await axios.post(`${API_URL}/todos`, { text });
      setText("");
      fetchTodos();
    } catch (err) {
      alert("Failed to add todo");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (err) {
      alert("Failed to delete todo");
    }
  };

  const startEdit = (id, currentText) => {
    setEditId(id);
    setEditText(currentText);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/${id}`, { text: editText });
      setEditId(null);
      setEditText("");
      fetchTodos();
    } catch (err) {
      alert("Failed to edit todo");
    }
  };

  const summarizeTodos = async () => {
    setMessage("⏳ Summarizing...");
    try {
      const res = await axios.post(`${API_URL}/summarize`);
      setMessage("✅ " + res.data.message);
    } catch (err) {
      setMessage("❌ Failed to send summary to Slack.");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "auto",
        fontFamily: "Arial",
      }}
    >
      <h1>📝 Todo Summary Assistant</h1>

      <input
        type="text"
        value={text}
        placeholder="Enter new todo..."
        onChange={(e) => setText(e.target.value)}
        style={{ padding: "0.5rem", width: "70%" }}
      />
      <button
        onClick={addTodo}
        style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
      >
        ➕ Add Todo
      </button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ margin: "1rem 0", fontSize: "1.1rem" }}>
            {editId === todo.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ padding: "0.3rem", fontSize: "1rem" }}
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  ✅ Save
                </button>
              </>
            ) : (
              <>
                • {todo.text}
                <button
                  onClick={() => startEdit(todo.id, todo.text)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  ❌ Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={summarizeTodos}
        style={{
          marginTop: "1rem",
          padding: "0.7rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
        }}
      >
        ✉️ Summarize and Send to Slack
      </button>

      {message && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}

export default App;
