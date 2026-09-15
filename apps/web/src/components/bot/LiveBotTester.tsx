import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Send, Bot, User, CheckCircle2, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  timestamp: string;
}

export const LiveBotTester: React.FC<{ onOrderCreated?: () => void }> = ({ onOrderCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! Moner Kotha শপে আপনাকে স্বাগতম। 🌸\nকোন প্রোডাক্টটি আপনি নিতে চান তা নির্বাচন করুন 👇',
      quickReplies: [
        { title: 'প্রিমিয়াম কাশ্মীরি কুর্তি - ৳৮৫০', payload: 'PROD_1' },
        { title: 'জয়পুরি কটন থ্রি-পিস - ৳১২৫০', payload: 'PROD_2' },
        { title: 'ডিজাইনার পার্টি গাউন - ৳১৫০০', payload: 'PROD_3' },
      ],
      timestamp: 'এখন',
    },
  ]);

  const [input, setInput] = useState('');
  const [step, setStep] = useState<'SELECT_PRODUCT' | 'SELECT_VARIANT' | 'PHONE' | 'ADDRESS' | 'CONFIRM'>('SELECT_PRODUCT');
  const [orderDraft, setOrderDraft] = useState<any>({
    productName: 'ডিজাইনার পার্টি গাউন',
    price: 1500,
    variant: 'Size: L (40)',
    deliveryCharge: 120,
  });

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text, timestamp: 'এখন' },
    ];
    setMessages(newMessages);
    if (!textToSend) setInput('');

    setTimeout(() => {
      processBotReply(text, newMessages);
    }, 500);
  };

  const handleQuickReply = (title: string, payload: string) => {
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text: title, timestamp: 'এখন' },
    ];
    setMessages(newMessages);

    setTimeout(() => {
      if (payload === 'PROD_1' || payload === 'PROD_2' || payload === 'PROD_3') {
        const prodName =
          payload === 'PROD_1'
            ? 'প্রিমিয়াম কাশ্মীরি কুর্তি'
            : payload === 'PROD_2'
            ? 'জয়পুরি কটন থ্রি-পিস'
            : 'ডিজাইনার পার্টি গাউন';
        const price = payload === 'PROD_1' ? 850 : payload === 'PROD_2' ? 1250 : 1500;
        setOrderDraft((prev: any) => ({ ...prev, productName: prodName, price }));
        setStep('SELECT_VARIANT');

        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: `আপনি নির্বাচন করেছেন: ${prodName} (৳${price}) ✨\nঅনুগ্রহ করে আপনার সাইজ বেছে নিন 👇`,
            quickReplies: [
              { title: 'Size: M (38)', payload: 'VAR_M' },
              { title: 'Size: L (40)', payload: 'VAR_L' },
              { title: 'Size: XL (42)', payload: 'VAR_XL' },
            ],
            timestamp: 'এখন',
          },
        ]);
      } else if (payload.startsWith('VAR_')) {
        const sizeName =
          payload === 'VAR_M' ? 'Size: M (38)' : payload === 'VAR_L' ? 'Size: L (40)' : 'Size: XL (42)';
        setOrderDraft((prev: any) => ({ ...prev, variant: sizeName }));
        setStep('PHONE');

        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: `চমৎকার! "${orderDraft.productName}" (${sizeName}) এর জন্য অনুগ্রহ করে আপনার নাম ও ১১ ডিজিটের মোবাইল নম্বর লিখে পাঠান:\n(যেমন: মনির, 01938909812)`,
            timestamp: 'এখন',
          },
        ]);
      } else if (payload === 'CONFIRM_YES') {
        api.createOrder({
          customerName: orderDraft.customerName || 'আলভিন মনির',
          customerPhone: orderDraft.customerPhone || '01938909812',
          deliveryAddress: orderDraft.deliveryAddress || 'মিরপুর ১০, ঢাকা',
          deliveryCity: 'Dhaka',
          itemsPrice: orderDraft.price,
          deliveryCharge: 120,
          totalPrice: orderDraft.price + 120,
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          items: [
            {
              id: `oi-${Date.now()}`,
              orderId: '',
              productId: 'prod-3',
              product: { title: orderDraft.productName, basePrice: orderDraft.price },
              variant: { name: orderDraft.variant },
              quantity: 1,
              unitPrice: orderDraft.price,
            },
          ],
        }).then((newOrd) => {
          toast.success(`নতুন অর্ডার #${newOrd.orderNumber} লাইভ ড্যাশবোর্ডে যুক্ত হয়েছে!`);
          if (onOrderCreated) onOrderCreated();

          setMessages([
            ...newMessages,
            {
              sender: 'bot',
              text: `🎉 অভিনন্দন ${orderDraft.customerName || ''}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n📦 অর্ডার নম্বর: #OF-${newOrd.orderNumber}\n👗 পণ্য: ${orderDraft.productName}\n💰 মোট: ৳${orderDraft.price + 120} (ক্যাশ অন ডেলিভারি)\n🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে পৌঁছে যাবে। ধন্যবাদ! ❤️`,
              timestamp: 'এখন',
            },
          ]);
        });
      }
    }, 450);
  };

  const processBotReply = (text: string, currentMsgs: Message[]) => {
    if (step === 'PHONE') {
      const phoneMatch = text.match(/(01[3-9]\d{8})/);
      const phone = phoneMatch ? phoneMatch[0] : '01938909812';
      const name = text.replace(phone, '').replace(/[,]/g, '').trim() || 'মনির ভাই';

      setOrderDraft((prev: any) => ({ ...prev, customerName: name, customerPhone: phone }));
      setStep('ADDRESS');

      setMessages([
        ...currentMsgs,
        {
          sender: 'bot',
          text: `ধন্যবাদ ${name}! এবার অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (যেমন: মিরপুর ১৬, ঢাকা):`,
          timestamp: 'এখন',
        },
      ]);
    } else if (step === 'ADDRESS') {
      const address = text;
      setOrderDraft((prev: any) => ({ ...prev, deliveryAddress: address }));
      setStep('CONFIRM');

      const total = orderDraft.price + 120;

      setMessages([
        ...currentMsgs,
        {
          sender: 'bot',
          text: `📝 আপনার অর্ডার সামারি:\n\n🛍️ প্রোডাক্ট: ${orderDraft.productName} (${orderDraft.variant})\n💵 পণ্যের দাম: ৳${orderDraft.price}\n🚚 ডেলিভারি চার্জ: ৳১২০\n💰 মোট বিল: ৳${total} (ক্যাশ অন ডেলিভারি)\n\n👤 নাম: ${orderDraft.customerName}\n📞 ফোন: ${orderDraft.customerPhone}\n📍 ঠিকানা: ${address}\n\nঅর্ডারটি নিশ্চিত করতে নিচের বাটনে চাপ দিন 👇`,
          quickReplies: [
            { title: '✅ কনফার্ম করুন', payload: 'CONFIRM_YES' },
            { title: '❌ বাতিল', payload: 'CANCEL' },
          ],
          timestamp: 'এখন',
        },
      ]);
    }
  };

  const resetChat = () => {
    setStep('SELECT_PRODUCT');
    setMessages([
      {
        sender: 'bot',
        text: 'আসসালামু আলাইকুম! Moner Kotha শপে আপনাকে স্বাগতম। 🌸\nকোন প্রোডাক্টটি আপনি নিতে চান তা নির্বাচন করুন 👇',
        quickReplies: [
          { title: 'প্রিমিয়াম কাশ্মীরি কুর্তি - ৳৮৫০', payload: 'PROD_1' },
          { title: 'জয়পুরি কটন থ্রি-পিস - ৳১২৫০', payload: 'PROD_2' },
          { title: 'ডিজাইনার পার্টি গাউন - ৳১৫০০', payload: 'PROD_3' },
        ],
        timestamp: 'এখন',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[580px] bg-[#0c0e15] border border-neutral-800/90 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Smartphone Top Notch & Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#121520] border-b border-neutral-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#121520] rounded-full" />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-100 text-sm flex items-center gap-1.5">
              Moner Kotha
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-300 font-bold rounded-md border border-blue-500/30">
                Active Now
              </span>
            </h4>
            <p className="text-[11px] text-neutral-400 font-medium">লাইভ কাস্টমার মেসেঞ্জার সিমুলেটর</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-750 transition-all border border-neutral-700/60 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          রিসেট
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090b10]/95 scrollbar-thin">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%]">
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#151924] text-neutral-200 border border-neutral-750/80 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Reply Buttons */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(qr.title, qr.payload)}
                        className="px-3.5 py-1.5 bg-[#161a26] hover:bg-blue-600 hover:text-white text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 hover:border-blue-400"
                      >
                        {qr.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#10131c] border-t border-neutral-800/80 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="মেসেজ লিখুন (যেমন: মনির, 01938909812, মিরপুর)..."
          className="flex-1 bg-[#090a0f] border border-neutral-750 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
