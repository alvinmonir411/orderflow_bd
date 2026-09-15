import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Send, Bot, User, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
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
      text: 'আসসালামু আলাইকুম! OrderFlow BD ডেমো শপে আপনাকে স্বাগতম। 🌸\nকোন প্রোডাক্টটি আপনি নিতে চান তা নির্বাচন করুন 👇',
      quickReplies: [
        { title: 'প্রিন্ট কুর্তি - ৳৮৫০', payload: 'PROD_1' },
        { title: 'জয়পুরি থ্রি-পিস - ৳১২৫০', payload: 'PROD_2' },
        { title: 'পার্টি কুর্তি - ৳১১০০', payload: 'PROD_3' },
      ],
      timestamp: 'এখন',
    },
  ]);

  const [input, setInput] = useState('');
  const [step, setStep] = useState<'SELECT_PRODUCT' | 'SELECT_VARIANT' | 'PHONE' | 'ADDRESS' | 'CONFIRM'>('SELECT_PRODUCT');
  const [orderDraft, setOrderDraft] = useState<any>({
    productName: 'প্রিমিয়াম কাশ্মীরি কুর্তি (মারুন)',
    price: 850,
    variant: 'Size: L (40)',
    deliveryCharge: 70,
  });

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text, timestamp: 'এখন' },
    ];
    setMessages(newMessages);
    if (!textToSend) setInput('');

    setTimeout(() => {
      processBotReply(text, newMessages);
    }, 600);
  };

  const handleQuickReply = (title: string, payload: string) => {
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text: title, timestamp: 'এখন' },
    ];
    setMessages(newMessages);

    setTimeout(() => {
      if (payload === 'PROD_1' || payload === 'PROD_2' || payload === 'PROD_3') {
        const prodName = payload === 'PROD_1' ? 'প্রিমিয়াম কাশ্মীরি কুর্তি' : payload === 'PROD_2' ? 'জয়পুরি থ্রি-পিস' : 'পার্টি কুর্তি';
        const price = payload === 'PROD_1' ? 850 : payload === 'PROD_2' ? 1250 : 1100;
        setOrderDraft((prev: any) => ({ ...prev, productName: prodName, price }));
        setStep('SELECT_VARIANT');

        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: `আপনি নির্বাচন করেছেন: ${prodName} (৳${price})\nঅনুগ্রহ করে আপনার সাইজ বেছে নিন 👇`,
            quickReplies: [
              { title: 'Size: M (38)', payload: 'VAR_M' },
              { title: 'Size: L (40)', payload: 'VAR_L' },
              { title: 'Size: XL (42)', payload: 'VAR_XL' },
            ],
            timestamp: 'এখন',
          },
        ]);
      } else if (payload.startsWith('VAR_')) {
        const sizeName = payload === 'VAR_M' ? 'Size: M (38)' : payload === 'VAR_L' ? 'Size: L (40)' : 'Size: XL (42)';
        setOrderDraft((prev: any) => ({ ...prev, variant: sizeName }));
        setStep('PHONE');

        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: `চমৎকার! "${orderDraft.productName}" (${sizeName}) এর জন্য অনুগ্রহ করে আপনার নাম ও ১১ ডিজিটের মোবাইল নম্বর লিখে পাঠান:\n(যেমন: সাকিব আল হাসান, 01712345678)`,
            timestamp: 'এখন',
          },
        ]);
      } else if (payload === 'CONFIRM_YES') {
        // Create Order in live store
        api.createOrder({
          customerName: orderDraft.customerName || 'সাকিব আল হাসান',
          customerPhone: orderDraft.customerPhone || '01712345678',
          deliveryAddress: orderDraft.deliveryAddress || 'মিরপুর ১০, ঢাকা',
          deliveryCity: 'Dhaka',
          itemsPrice: orderDraft.price,
          deliveryCharge: 70,
          totalPrice: orderDraft.price + 70,
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          items: [
            {
              id: `oi-${Date.now()}`,
              orderId: '',
              productId: 'prod-1',
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
              text: `🎉 অভিনন্দন ${orderDraft.customerName || ''}! আপনার অর্ডারটি গ্রহণ করা হয়েছে।\n\n📦 অর্ডার নম্বর: #${newOrd.orderNumber}\n💰 মোট: ৳${orderDraft.price + 70} (ক্যাশ অন ডেলিভারি)\n🚚 ২-৩ দিনের মধ্যে ডেলিভারি সম্পন্ন হবে। ধন্যবাদ! ❤️`,
              timestamp: 'এখন',
            },
          ]);
        });
      }
    }, 500);
  };

  const processBotReply = (text: string, currentMsgs: Message[]) => {
    if (step === 'PHONE') {
      const phoneMatch = text.match(/(01[3-9]\d{8})/);
      const phone = phoneMatch ? phoneMatch[0] : '01712345678';
      const name = text.replace(phone, '').replace(/[,]/g, '').trim() || 'সম্মানিত কাস্টমার';

      setOrderDraft((prev: any) => ({ ...prev, customerName: name, customerPhone: phone }));
      setStep('ADDRESS');

      setMessages([
        ...currentMsgs,
        {
          sender: 'bot',
          text: `ধন্যবাদ ${name}! এবার অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (যেমন: বাসা #৪, রোড #২, ধানমন্ডি, ঢাকা):`,
          timestamp: 'এখন',
        },
      ]);
    } else if (step === 'ADDRESS') {
      const address = text;
      setOrderDraft((prev: any) => ({ ...prev, deliveryAddress: address }));
      setStep('CONFIRM');

      const total = orderDraft.price + 70;

      setMessages([
        ...currentMsgs,
        {
          sender: 'bot',
          text: `📝 আপনার অর্ডার সামারি:\n\n🛍️ প্রোডাক্ট: ${orderDraft.productName} (${orderDraft.variant})\n💵 পণ্যের দাম: ৳${orderDraft.price}\n🚚 ডেলিভারি চার্জ: ৳৭০\n💰 মোট প্রদেয়: ৳${total} (ক্যাশ অন ডেলিভারি)\n\n👤 নাম: ${orderDraft.customerName}\n📞 ফোন: ${orderDraft.customerPhone}\n📍 ঠিকানা: ${address}\n\nঅর্ডারটি কনফার্ম করতে নিচের বাটনে চাপ দিন 👇`,
          quickReplies: [
            { title: '✅ কনফার্ম করুন', payload: 'CONFIRM_YES' },
            { title: '❌ বাতিল করুন', payload: 'CANCEL' },
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
        text: 'আসসালামু আলাইকুম! OrderFlow BD ডেমো শপে আপনাকে স্বাগতম। 🌸\nকোন প্রোডাক্টটি আপনি নিতে চান তা নির্বাচন করুন 👇',
        quickReplies: [
          { title: 'প্রিন্ট কুর্তি - ৳৮৫০', payload: 'PROD_1' },
          { title: 'জয়পুরি থ্রি-পিস - ৳১২৫০', payload: 'PROD_2' },
          { title: 'পার্টি কুর্তি - ৳১১০০', payload: 'PROD_3' },
        ],
        timestamp: 'এখন',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[560px] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-950 rounded-full" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-100 text-sm flex items-center gap-1.5">
              Facebook Messenger বটের লাইভ সিমুলেটর
              <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 font-normal rounded">
                Live Interactive
              </span>
            </h4>
            <p className="text-xs text-neutral-400">কাস্টমার যেভাবে মেসেঞ্জারে অর্ডার করবে</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          রিসেট চ্যাট
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-900/60">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[85%]">
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div>
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Reply Buttons */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(qr.title, qr.payload)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium transition-all shadow-sm active:scale-95"
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

      {/* Input Form */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="মেসেজ লিখুন বা বাটনে চাপ দিন..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
