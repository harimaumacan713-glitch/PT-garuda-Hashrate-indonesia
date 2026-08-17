import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Globe, Lock, Users, Target, BarChart2, 
  Paperclip, Image as ImageIcon, X, Plus, TrendingUp, TrendingDown,
  Smile, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { UserProfileAvatar } from '../components/UserProfileAvatar';

interface CreatePostPageProps {
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
  initialText?: string;
  defaultSymbol?: string;
}

export function CreatePostPage({ 
  onClose, 
  onPostCreated, 
  initialText = '',
  defaultSymbol 
}: CreatePostPageProps) {
  const { user } = useAuth();
  const activeUid = user ? user.uid : 'demo_user';

  const [text, setText] = useState(initialText || (defaultSymbol ? `$${defaultSymbol} ` : ''));
  const [audience, setAudience] = useState<'Semua Orang' | 'Pengikut' | 'Hanya Saya'>('Semua Orang');
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile data
  const defaultDisplayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Investor');
  const defaultUsername = user?.email ? user.email.split('@')[0] : 'investor_user';
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [avatarId, setAvatarId] = useState('cat_glasses');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/bottts/svg?seed=${defaultUsername}&backgroundColor=b6e3f4`);

  // Attachments state
  const [sentiment, setSentiment] = useState<'BULLISH' | 'BEARISH' | null>(null);
  const [showSentimentPicker, setShowSentimentPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile details
  useEffect(() => {
    const profileRef = ref(db, `users/${activeUid}/profileData`);
    get(profileRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.username) setUsername(data.username);
        if (data.displayName) setDisplayName(data.displayName);
        if (data.avatarId) setAvatarId(data.avatarId);
        if (data.photoUrl) setCustomPhotoUrl(data.photoUrl);
        else if (data.customPhotoUrl) setCustomPhotoUrl(data.customPhotoUrl);
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      }
    }).catch(console.error);

    // Auto focus textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeUid]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAttachedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleGifs = [
    { name: 'To The Moon', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400' },
    { name: 'Bull Market', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400' },
    { name: 'HODL Momentum', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&q=80&w=400' },
    { name: 'Buy The Dip', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400' }
  ];

  const handlePost = async () => {
    if (!text.trim() && !attachedImage) return;

    setIsSubmitting(true);
    try {
      const newPost = {
        author: username || defaultUsername,
        authorName: displayName || defaultDisplayName,
        authorUid: activeUid,
        avatar: customPhotoUrl || avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username || defaultUsername}&backgroundColor=b6e3f4`,
        avatarId: avatarId || 'cat_glasses',
        photoUrl: customPhotoUrl || null,
        text: text.trim(),
        audience,
        sentiment: sentiment || null,
        mediaUrl: attachedImage || null,
        poll: showPoll ? {
          question: text.trim() || 'Pertanyaan Polling',
          options: pollOptions.filter(o => o.trim().length > 0).map(text => ({ text, votes: 0 })),
          totalVotes: 0
        } : null,
        time: 'Baru saja',
        createdAt: Date.now(),
        likes: 0,
        dislikes: 0,
        comments: 0
      };

      // Save to Firebase Realtime Database
      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        ...newPost,
        id: newPostRef.key
      });

      if (onPostCreated) {
        onPostCreated({
          ...newPost,
          id: newPostRef.key
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      // Fallback local close
      if (onPostCreated) {
        onPostCreated({
          id: `post_${Date.now()}`,
          author: username || defaultUsername,
          avatar: avatarUrl,
          text: text.trim(),
          time: 'Baru saja',
          likes: 0,
          comments: 0
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostActive = text.trim().length > 0 || attachedImage !== null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-150">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* TOP HEADER */}
      <header className="flex h-14 items-center justify-between px-4 border-b border-gray-100 bg-white shrink-0">
        <button 
          onClick={onClose}
          className="p-1 -ml-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">
          Buat Postingan
        </h1>

        <button 
          onClick={handlePost}
          disabled={!isPostActive || isSubmitting}
          className={cn(
            "text-[15px] font-bold transition-colors duration-150 px-2 py-1",
            isPostActive && !isSubmitting 
              ? "text-[#00B26A] hover:text-[#009659] cursor-pointer" 
              : "text-[#A3E5C8] cursor-not-allowed"
          )}
        >
          {isSubmitting ? 'Memuat...' : 'Post'}
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 no-scrollbar">
        {/* User Info & Audience Row */}
        <div className="flex items-center gap-3 mb-4">
          <UserProfileAvatar avatarId={avatarId} customPhotoUrl={customPhotoUrl} size="md" />

          <div className="flex flex-col items-start">
            <span className="text-[14px] font-bold text-gray-900 leading-tight">
              {username}
            </span>

            {/* Audience Dropdown Button */}
            <div className="relative mt-1">
              <button 
                onClick={() => setShowAudienceMenu(!showAudienceMenu)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-medium text-gray-600 shadow-2xs transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>{audience}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Audience Popup Menu */}
              {showAudienceMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                  {[
                    { label: 'Semua Orang', desc: 'Publik, siapa saja bisa lihat', icon: Globe },
                    { label: 'Pengikut', desc: 'Hanya followers Anda', icon: Users },
                    { label: 'Hanya Saya', desc: 'Privat', icon: Lock }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setAudience(item.label as any);
                        setShowAudienceMenu(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-gray-50 transition-colors",
                        audience === item.label && "bg-green-50/50"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 mt-0.5 shrink-0", audience === item.label ? "text-[#00B26A]" : "text-gray-400")} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-[12px] font-bold", audience === item.label ? "text-[#00B26A]" : "text-gray-800")}>
                            {item.label}
                          </span>
                          {audience === item.label && <Check className="w-3.5 h-3.5 text-[#00B26A]" />}
                        </div>
                        <p className="text-[10px] text-gray-400">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis ide kamu di sini..."
          rows={7}
          className="w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none resize-none leading-relaxed border-none p-0 focus:ring-0"
        />

        {/* Sentiment Tag Display if active */}
        {sentiment && (
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border",
              sentiment === 'BULLISH' 
                ? "bg-emerald-50 text-[#00B26A] border-emerald-200" 
                : "bg-rose-50 text-[#e11d48] border-rose-200"
            )}>
              {sentiment === 'BULLISH' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{sentiment === 'BULLISH' ? 'Bullish (Beli/Optimis)' : 'Bearish (Jual/Pesimis)'}</span>
              <button 
                onClick={() => setSentiment(null)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-200 max-h-64 bg-gray-50 flex items-center justify-center">
            <img src={attachedImage} alt="Attachment" className="w-full h-full object-contain" />
            <button 
              onClick={() => setAttachedImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Poll Component Preview */}
        {showPoll && (
          <div className="mb-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] font-bold text-gray-700 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#00B26A]" /> Polling Komunitas
              </span>
              <button 
                onClick={() => setShowPoll(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Pilihan ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#00B26A]"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-xs text-[#00B26A] font-semibold flex items-center gap-1 mt-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pilihan
                </button>
              )}
            </div>
          </div>
        )}

        {/* GIF Picker Modal/Overlay */}
        {showGifPicker && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-gray-700">Pilih Trading GIF</span>
              <button onClick={() => setShowGifPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleGifs.map((gif) => (
                <div 
                  key={gif.name} 
                  onClick={() => {
                    setAttachedImage(gif.url);
                    setShowGifPicker(false);
                  }}
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-gray-200 bg-white hover:border-[#00B26A] transition-all"
                >
                  <img src={gif.url} alt={gif.name} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                    <span className="text-[11px] font-bold text-white drop-shadow">{gif.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment Picker Dropdown */}
        {showSentimentPicker && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-gray-700">Tentukan Target Sentimen Ide</span>
              <button onClick={() => setShowSentimentPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSentiment('BULLISH');
                  setShowSentimentPicker(false);
                }}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition-all",
                  sentiment === 'BULLISH' 
                    ? "bg-emerald-50 border-emerald-400 text-[#00B26A]" 
                    : "bg-white border-gray-200 text-gray-700 hover:bg-emerald-50/50"
                )}
              >
                <TrendingUp className="w-4 h-4 text-[#00B26A]" /> Bullish (Optimis)
              </button>
              <button
                onClick={() => {
                  setSentiment('BEARISH');
                  setShowSentimentPicker(false);
                }}
                className={cn(
                  "p-2.5 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition-all",
                  sentiment === 'BEARISH' 
                    ? "bg-rose-50 border-rose-400 text-[#e11d48]" 
                    : "bg-white border-gray-200 text-gray-700 hover:bg-rose-50/50"
                )}
              >
                <TrendingDown className="w-4 h-4 text-[#e11d48]" /> Bearish (Pesimis)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER TOOLBAR (Matching the uploaded Stockbit screenshot icons) */}
      <footer className="h-14 border-t border-gray-100 bg-white flex items-center justify-end px-5 gap-5 shrink-0">
        {/* 1. Target / Bullish-Bearish sentiment icon */}
        <button 
          onClick={() => setShowSentimentPicker(!showSentimentPicker)}
          title="Target / Sentimen"
          className={cn(
            "p-2 rounded-full transition-colors hover:bg-gray-100",
            sentiment ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-700"
          )}
        >
          <Target className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* 2. Poll / Chart icon */}
        <button 
          onClick={() => setShowPoll(!showPoll)}
          title="Polling Komunitas"
          className={cn(
            "p-2 rounded-full transition-colors hover:bg-gray-100",
            showPoll ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-700"
          )}
        >
          <BarChart2 className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* 3. GIF button */}
        <button 
          onClick={() => setShowGifPicker(!showGifPicker)}
          title="Pilih GIF"
          className={cn(
            "px-1.5 py-0.5 rounded border border-gray-300 text-[11px] font-black tracking-wide transition-colors",
            showGifPicker ? "border-[#00B26A] text-[#00B26A]" : "text-gray-400 hover:text-gray-700 hover:border-gray-400"
          )}
        >
          GIF
        </button>

        {/* 4. Paperclip / Attachment icon */}
        <button 
          onClick={() => {
            const sym = prompt('Masukkan Kode Saham/Kripto (contoh: BBCA, BTC, GOTO):');
            if (sym) {
              setText(prev => `${prev} $${sym.toUpperCase().trim()} `);
            }
          }}
          title="Lampirkan Simbol Saham/Kripto ($)"
          className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Paperclip className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* 5. Image / Gallery icon */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          title="Unggah Foto/Gambar"
          className={cn(
            "p-2 rounded-full transition-colors hover:bg-gray-100",
            attachedImage ? "text-[#00B26A]" : "text-gray-400 hover:text-gray-700"
          )}
        >
          <ImageIcon className="w-5 h-5 stroke-[1.75]" />
        </button>
      </footer>
    </div>
  );
}
