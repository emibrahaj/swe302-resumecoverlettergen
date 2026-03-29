"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("backend is not connected"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">AI Resume Project</h1>
      <div className="p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
        <p className="text-xl italic">
          Backend says: <span className="font-mono text-green-400">"{message}"</span>
        </p>
      </div>
    </main>
  );
}