"use client"
import { Textarea } from "@/components/ui/textarea";
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function Commments() {
  const params = useParams()
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<String>("");

  const generateResponse = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);

    const response = await fetch(`/api/watch/${params?.videoId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: input,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return <div className="container grid items-center gap-6 px-8 pb-8 pt-6 md:py-10" >
    <h3 className="scroll-m-20 text-lg font-extrabold tracking-tight lg:text-5xl">
      Comentarios
    </h3>
    <Textarea className="h-32 w-full"
      value={input}
      onChange={(e) => setInput(e.target.value)} />
    {response && (
      <div className="mt-8 rounded-xl border bg-white p-4 shadow-md transition hover:bg-gray-100">
        {response}
      </div>
    )}
    {!loading ? (
      <button
        className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
        onClick={(e) => generateResponse(e)}
      >
        Generate Response &rarr;
      </button>
    ) : (
      <button
        disabled
        className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white"
      >
        <div className="animate-pulse font-bold tracking-widest">...</div>
      </button>
    )}
  </div>
}
