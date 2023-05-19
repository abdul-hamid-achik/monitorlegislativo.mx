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

    console.log(params?.videoId)
    try {
      const res = await fetch(`/api/watch/${params?.videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
        }),
      });


      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = res.body;

      if (!data) {
        return;
      }

      console.log(data)

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setResponse((prev) => prev + chunkValue);
      }

      console.log(res)
      reader.cancel();

    } catch (exception) {
      console.log(exception)
    }
    setLoading(false);
  };

  return <div className="container grid items-center gap-6 px-8 pb-8 pt-6 md:py-10" >
    <h4 className="lg:text-1xl scroll-m-20 text-sm font-extrabold tracking-tight">
      Preguntas?
    </h4>
    <p>
      puedes hacer preguntas sobre lo que se discutio en el video o sobre quien lo discutio
    </p>
    <Textarea className="h-32 w-full"
      value={input}
      onChange={(e) => setInput(e.target.value)} />
    {response && (
      <div className="mt-8 rounded-xl border p-4 shadow-md transition hover:bg-gray-700">
        {response}
      </div>
    )}
    {!loading ? (
      <button
        className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80"
        onClick={(e) => generateResponse(e)}
      >
        Enviar &rarr;
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
