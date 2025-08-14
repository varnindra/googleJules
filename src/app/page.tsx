"use client";

import { useState } from "react";

export default function Home() {
  // State for registration form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // State for API response
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [createdUser, setCreatedUser] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setCreatedUser(data.user);
      setMessage(`User ${data.user.name} created successfully! You are the Family Owner.`);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Family Finance Management</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
        <h2>Register First User (Create Family)</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Name: </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>Register</button>
        </form>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {createdUser && <pre><code>{JSON.stringify(createdUser, null, 2)}</code></pre>}
      </div>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem", backgroundColor: "#f0f0f0" }}>
          <h2>Create Transaction (Disabled)</h2>
          <p>This feature is disabled because the testing environment prevents seeding a default category.</p>
          <p>Once a category can be created, this form can be enabled to test the transaction API.</p>
      </div>

    </main>
  );
}
