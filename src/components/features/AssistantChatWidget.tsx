'use client';

import * as React from 'react';
import { Card, Button } from '@/components/ui';
import { RAGResponse } from '@/infrastructure/rag/types';

let msgIdCounter = 0;

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: RAGResponse['sources'];
  safetyNotice?: string;
  usedFallback?: boolean;
}

interface AssistantChatWidgetProps {
  context?: {
    serviceSlug?: string;
    productSlugs?: string[];
    safetyFlags?: string[];
    currentStatus?: string;
  };
  embedded?: boolean;
}

export function AssistantChatWidget({ context, embedded = false }: AssistantChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(embedded);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý Tư vấn của Digital Wellness Spa. Bạn có thắc mắc gì về quy trình trị liệu, toa dưỡng tại nhà hay các lưu ý an toàn không?',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `u-${++msgIdCounter}`,
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        const data: RAGResponse = json.data;
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${++msgIdCounter}`,
            sender: 'assistant',
            text: data.answer,
            sources: data.sources,
            safetyNotice: data.safetyNotice,
            usedFallback: data.usedFallback,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${++msgIdCounter}`,
            sender: 'assistant',
            text: json.error || 'Có lỗi xảy ra khi kết nối trợ lý.',
            usedFallback: true,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${++msgIdCounter}`,
          sender: 'assistant',
          text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.',
          usedFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Toa sản phẩm tại nhà dùng như thế nào?',
    'Phụ nữ mang thai cần lưu ý gì?',
    'Dịch vụ kéo dài trong bao lâu?',
  ];

  if (!isOpen && !embedded) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#405C4E] px-4 py-3 text-sm font-medium text-white shadow-xl transition-transform hover:scale-105 hover:bg-[#2D4137]"
          aria-label="Mở Trợ lý tư vấn AI"
        >
          <span className="text-lg">🌿</span>
          <span>Trợ Lý Spa AI</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#C28265]" />
        </button>
      </div>
    );
  }

  return (
    <Card
      className={`${
        embedded
          ? 'w-full border-[#D4C8B8] bg-white shadow-sm'
          : 'fixed right-6 bottom-6 z-50 flex h-[540px] w-full max-w-sm flex-col border-[#405C4E] bg-white shadow-2xl sm:w-96'
      } overflow-hidden rounded-2xl`}
    >
      {/* Header chat */}
      <div className="flex items-center justify-between border-b border-[#E2D9CC] bg-[#FAF7F2] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5EDE8] text-base text-[#405C4E]">
            🌿
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#2B2622]">Trợ Lý Tư Vấn Spa</h4>
            <span className="text-[10px] text-[#82786F]">Trích nguồn tài liệu chính thống</span>
          </div>
        </div>
        {!embedded && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-[#82786F] hover:bg-[#E2D9CC] hover:text-[#2B2622]"
            aria-label="Đóng khung chat"
          >
            ✕
          </button>
        )}
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'rounded-br-none bg-[#405C4E] text-white'
                  : 'rounded-bl-none border border-[#E2D9CC] bg-[#FAF7F2] text-[#2B2622]'
              }`}
            >
              {m.safetyNotice === 'RED_FLAG' && (
                <div className="mb-2 rounded-lg border border-[#964F3D]/20 bg-[#FBF0EE] p-2 font-semibold text-[#964F3D]">
                  ⚠️ CẢNH BÁO Y TẾ KHẨN CẤP
                </div>
              )}
              {m.safetyNotice === 'PROMPT_INJECTION' && (
                <div className="mb-2 rounded-lg bg-[#FAF0E6] p-2 font-semibold text-[#8C5E3C]">
                  🛡️ BẢO VỆ AN TOÀN
                </div>
              )}
              <p className="whitespace-pre-line">{m.text}</p>

              {/* Nguồn trích dẫn tài liệu */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 border-t border-[#E2D9CC]/60 pt-2">
                  <span className="block text-[10px] font-semibold text-[#635B54]">
                    Nguồn tài liệu tham khảo:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-[#E5EDE8] px-1.5 py-0.5 text-[9px] font-medium text-[#405C4E]"
                      >
                        [{idx + 1}] {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#82786F]">
            <div className="flex h-2 w-2 animate-bounce rounded-full bg-[#405C4E]" />
            <div className="flex h-2 w-2 animate-bounce rounded-full bg-[#405C4E] [animation-delay:0.2s]" />
            <div className="flex h-2 w-2 animate-bounce rounded-full bg-[#405C4E] [animation-delay:0.4s]" />
            <span className="text-[11px]">Đang tra cứu tài liệu spa...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Gợi ý câu hỏi nhanh */}
      <div className="border-t border-[#E2D9CC]/50 bg-[#FAF7F2]/50 px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="rounded-full border border-[#D4C8B8] bg-white px-2 py-0.5 text-[10px] text-[#635B54] transition-colors hover:border-[#405C4E] hover:text-[#405C4E] disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="border-t border-[#E2D9CC] bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Đặt câu hỏi về liệu trình, sản phẩm..."
            className="flex-1 rounded-xl border border-[#D4C8B8] bg-[#FAF7F2] px-3 py-2 text-xs text-[#2B2622] placeholder-[#82786F] focus:ring-1 focus:ring-[#405C4E] focus:outline-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || !input.trim()}
            className="h-8 px-3"
          >
            Gửi
          </Button>
        </form>
      </div>
    </Card>
  );
}
