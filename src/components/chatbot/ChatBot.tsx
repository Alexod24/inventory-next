"use client";

import { useState, useRef, useEffect } from "react";


const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola! ¿En qué puedo ayudarte?", from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, from: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: input }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { text: data.error, from: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: `El stock de ${input} es ${data.stock}`, from: "bot" },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Hubo un error al consultar el stock.", from: "bot" },
      ]);
    }

    setInput("");
  };

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h8m-8 4h6"
            />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex max-h-[480px] w-[360px] flex-col rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Chatbot Inventario
            </h4>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
            
                  msg.from === "bot"
                    ? "bg-primary text-white rounded-bl-none self-start"
                    : "bg-gray-200 text-gray-900 rounded-br-none self-end dark:bg-gray-700 dark:text-gray-100"
            }
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <input
              type="text"
              aria-label="Escribe un mensaje"
              placeholder="Escribe un producto..."
              className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="ml-3 rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
