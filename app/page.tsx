"use client";
import { motion } from "motion/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";
import { useState } from "react";
import { Send, Bot, User, Zap, UserCircle } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 p-4">
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </motion.div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm MedVoice AI. How can I assist you with your healthcare needs today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "I understand you need assistance. Let me help you with that. Would you like to schedule an appointment or check symptoms?",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="relative z-10 mx-auto mt-20 w-full max-w-6xl px-4"
    >
      <h2 className="mb-8 text-center text-4xl font-bold text-slate-800 md:text-5xl dark:text-slate-200">
        Try Our AI Assistant
      </h2>
      
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-neutral-900">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white">
              <Bot className="size-8 text-[#8B5CF6]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">MedVoice AI</h3>
              <p className="text-[15px] text-white/90">Online • Ready to help</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[500px] space-y-5 overflow-y-auto bg-[#FAFAFA] p-8 dark:bg-neutral-950">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[75%] gap-4 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]"
                      : "bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="size-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Bot className="size-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-6 py-4 ${
                    message.type === "user"
                      ? "bg-[#3B82F6] text-white"
                      : "bg-white text-slate-800 shadow-sm dark:bg-neutral-800 dark:text-slate-200"
                  }`}
                >
                  <p className="text-[16px] leading-relaxed">{message.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 rounded-full border border-neutral-300 bg-[#F5F5F5] px-6 py-4 text-[16px] text-slate-800 placeholder:text-gray-500 focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <button
              onClick={handleSendMessage}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Send className="size-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      {/* Decorative lines */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>

      <div className="px-4 py-20">
        {/* Hero Section */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"🩺 Revolutionize Patient Care with AI-Powered Voice Assistance"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Deliver instant, accurate medical assistance through natural voice
          conversations. Automate appointment scheduling, symptom checking, and
          follow-up care-24/7.
        </motion.p>

        <Link href={"/sign-in"}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Get Started
            </button>
          </motion.div>
        </Link>

        {/* Chat Section */}
        <ChatSection />

        {/* Feature Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mx-auto mt-32 max-w-6xl"
        >
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Bot className="size-8 text-white" strokeWidth={2.5} />}
              title="24/7 AI Support"
              description="Always available to answer patient questions and provide medical guidance."
            />
            <FeatureCard
              icon={<Zap className="size-8 text-white" strokeWidth={2.5} />}
              title="Instant Responses"
              description="Get immediate answers to health queries without waiting times."
            />
            <FeatureCard
              icon={<UserCircle className="size-8 text-white" strokeWidth={2.5} />}
              title="Personalized Care"
              description="Tailored health recommendations based on patient history."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const { user } = useUser();
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">MedVoice AI</h1>
      </div>
      {!user ? (
        <Link href={"/sign-in"}>
          <button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Login
          </button>
        </Link>
      ) : (
        <div className="flex items-center gap-5">
  <UserButton />
  <Link href="/dashboard">
    <Button>Dashboard</Button>
  </Link>
</div>
      )}
    </nav>
  );
};