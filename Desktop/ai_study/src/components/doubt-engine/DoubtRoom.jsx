import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Download, Share2, Copy, Trash2 } from 'lucide-react';
import { chatWithAI } from '../../services/aiService';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoubtRoom() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('chat'); // 'chat' or 'image'
    const [longPressItem, setLongPressItem] = useState(null);
    const [longPressTimer, setLongPressTimer] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleLongPressStart = (msgId) => {
        const timer = setTimeout(() => {
            setLongPressItem(msgId);
        }, 500);
        setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setLongPressItem(null);
    };

    const handleShare = async (text) => {
        if (navigator.share) {
            await navigator.share({ text });
        }
        setLongPressItem(null);
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
    };

    const handleDownloadImage = (imageUrl) => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'ai-generated-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Force image mode if mode is 'image'
            const query = mode === 'image' ? `Generate an image of: ${input}` : input;
            const data = await chatWithAI(query);
            const aiMsg = {
                id: Date.now() + 1,
                type: 'ai',
                text: data.response,
                videos: data.videos,
                image: data.image
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 relative">
            {/* iOS-style Header */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="NERMEXITY" className="w-8 h-8 object-contain" />
                    <div>
                        <h2 className="text-white font-semibold text-sm">NERMEXITY Assistant</h2>
                        <p className="text-xs text-slate-400">AI Study Companion</p>
                    </div>
                </div>
                <button
                    onClick={handleNewChat}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                >
                    New Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                            <Bot className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">How can I help you study?</h3>
                        <p className="text-slate-400 text-sm">Ask me anything or generate visualizations</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex gap-2 mb-4 items-end",
                            msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                        onTouchStart={() => handleLongPressStart(msg.id)}
                        onTouchEnd={handleLongPressEnd}
                        onMouseDown={() => handleLongPressStart(msg.id)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                    >
                        {msg.type === 'ai' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={clsx(
                            "max-w-[80%] relative",
                            msg.type === 'user' ? "ml-auto" : "mr-auto"
                        )}>
                            <div className={clsx(
                                "rounded-2xl px-4 py-2.5 shadow-lg",
                                msg.type === 'user'
                                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-md"
                                    : "bg-slate-800/90 backdrop-blur-sm text-slate-100 rounded-bl-md border border-white/5"
                            )}>
                                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                            </div>

                            {/* Generated Image */}
                            {msg.image && (
                                <div className="mt-2 relative group">
                                    <img
                                        src={msg.image}
                                        alt="AI Generated"
                                        className="w-full max-w-md max-h-96 object-contain rounded-2xl border border-white/10"
                                    />
                                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDownloadImage(msg.image)}
                                            className="bg-black/60 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/80 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => window.open(msg.image, '_blank')}
                                            className="bg-black/60 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/80 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Long Press Menu */}
                            <AnimatePresence>
                                {longPressItem === msg.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex gap-1 p-1.5"
                                    >
                                        <button
                                            onClick={() => handleCopy(msg.text)}
                                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs text-slate-300">Copy</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare(msg.text)}
                                            className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs text-slate-300">Share</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {msg.type === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 mb-4">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* iOS-style Bottom Toolbar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 pb-safe z-30">
                {/* Mode Switcher */}
                <div className="px-4 pt-3 pb-2">
                    <div className="flex gap-2 bg-slate-800/60 rounded-full p-1">
                        <button
                            onClick={() => setMode('chat')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all text-sm font-medium",
                                mode === 'chat'
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all text-sm font-medium",
                                mode === 'image'
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Sparkles className="w-4 h-4" />
                            Image
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="px-4 pb-4">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 bg-slate-800/60 rounded-3xl px-4 py-2 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'chat' ? "Ask me anything..." : "Describe the image..."}
                                className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
                                mode === 'chat'
                                    ? "bg-indigo-600 hover:bg-indigo-500"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90",
                                "disabled:opacity-40 disabled:cursor-not-allowed"
                            )}
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Backdrop for long press menu */}
            {longPressItem && (
                <div
                    className="fixed inset-0 bg-black/20 z-10"
                    onClick={() => setLongPressItem(null)}
                />
            )}
        </div>
    );
}
