"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // State for registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  // State for seeding
  const [seedMessage, setSeedMessage] = useState("");
  const [seedError, setSeedError] = useState("");

  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDescription, setTxDescription] = useState("");
  const [txMessage, setTxMessage] = useState("");
  const [txError, setTxError] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");
    setRegisterError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCreatedUser(data.user);
      setRegisterMessage(`User ${data.user.name} created! You are the Family Owner.`);
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  const handleSeed = async () => {
    setSeedMessage("");
    setSeedError("");
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSeedMessage("Database seeded with 'General' category.");
    } catch (err) {
      setSeedError(err.message);
    }
  };

  const fetchTransactions = async () => {
      if (!createdUser?.familyGroupId) return;
      try {
        const res = await fetch(`/api/transactions?familyGroupId=${createdUser.familyGroupId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setTransactions(data);
      } catch (err) {
        setTxError("Could not fetch transactions: " + err.message);
      }
  }

  const handleCreateTransaction = async (e) => {
      e.preventDefault();
      setTxMessage("");
      setTxError("");
      try {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: parseFloat(txAmount),
                date: new Date(txDate),
                description: txDescription,
                userId: createdUser.id,
                categoryId: "cl_general_category_01", // Hardcoded seeded category
                type: "EXPENSE"
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setTxMessage("Transaction created successfully!");
        fetchTransactions(); // Refresh list
      } catch (err) {
          setTxError(err.message);
      }
  }

  // Fetch transactions when user is created/set
  useEffect(() => {
    if (createdUser) {
        fetchTransactions();
    }
  }, [createdUser]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Family Finance Management</h1>
      <p>Follow the steps below to test the application flow.</p>

      {/* Step 1: Register */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
        <h2>Step 1: Register First User</h2>
        <form onSubmit={handleRegister}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ marginLeft: "0.5rem" }}/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ marginLeft: "0.5rem" }}/>
          <button type="submit" style={{ marginLeft: "1rem" }}>Register</button>
        </form>
        {registerMessage && <p style={{ color: "green" }}>{registerMessage}</p>}
        {registerError && <p style={{ color: "red" }}>{registerError}</p>}
        {createdUser && <pre><code>{JSON.stringify(createdUser, null, 2)}</code></pre>}
      </div>

      {/* Step 2: Seed Database */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
          <h2>Step 2: Seed Database</h2>
          <button onClick={handleSeed} disabled={!createdUser}>Seed 'General' Category</button>
          {seedMessage && <p style={{ color: "green" }}>{seedMessage}</p>}
          {seedError && <p style={{ color: "red" }}>{seedError}</p>}
      </div>

      {/* Step 3: Create Transaction */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
          <h2>Step 3: Create a Transaction</h2>
          <form onSubmit={handleCreateTransaction}>
              <input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="Amount" required />
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} required style={{ marginLeft: "0.5rem" }}/>
              <input type="text" value={txDescription} onChange={e => setTxDescription(e.target.value)} placeholder="Description" style={{ marginLeft: "0.5rem" }}/>
              <button type="submit" disabled={!createdUser} style={{ marginLeft: "1rem" }}>Create Expense</button>
          </form>
          {txMessage && <p style={{ color: "green" }}>{txMessage}</p>}
          {txError && <p style={{ color: "red" }}>{txError}</p>}
      </div>

      {/* Step 4: View Transactions */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
          <h2>Step 4: Transaction List</h2>
          <button onClick={fetchTransactions} disabled={!createdUser}>Refresh Transactions</button>
          <ul style={{ listStyleType: "none", padding: 0, marginTop: "1rem" }}>
              {transactions.map(tx => (
                  <li key={tx.id} style={{ border: "1px solid #eee", padding: "0.5rem", marginTop: "0.5rem" }}>
                      <div><strong>{tx.description || "Transaction"}</strong>: ${tx.amount}</div>
                      <div style={{ fontSize: "0.8rem", color: "#555" }}>{new Date(tx.date).toLocaleDateString()} | by {tx.user.name} | Category: {tx.category.name}</div>
                  </li>
              ))}
          </ul>
      </div>

    </main>
  );
}
