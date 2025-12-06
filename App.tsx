import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, Send, Smartphone, Download, Check, User, ChevronRight, X, AudioLines, Mic, Sparkles } from 'lucide-react';
import { Post, ViewState, ChatMessage } from './types';
import { generateForumPosts, FALLBACK_POSTS } from './services/geminiService';

// --- NGA Theme Constants ---
const THEME = {
  headerBg: 'bg-[#58140C]', // NGA Dark Red
  bodyBg: 'bg-[#FFF9E6]', // NGA Cream
  postBg: 'bg-[#FFFAEE]', // Light Cream
  postBorder: 'border-[#F0E6D2]',
  textMain: 'text-[#333333]',
  textSub: 'text-[#888888]',
  link: 'text-[#58140C]',
  quoteBg: 'bg-[#F4E8D1]',
};

// --- Helper Components ---

const Header = ({ title, showBack, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) => (
  <header className={`sticky top-0 z-50 ${THEME.headerBg} text-white shadow-md px-4 h-12 flex items-center`}>
    {showBack && (
      <button onClick={onBack} className="mr-3 p-1 hover:bg-white/10 rounded-full transition-colors">
        <ArrowLeft size={20} />
      </button>
    )}
    <h1 className="text-base font-bold truncate flex-1 tracking-wide">{title}</h1>
    {!showBack && <User size={20} className="text-[#EBCcb4]" />}
  </header>
);

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.FORUM_LIST);
  const [scrollPos, setScrollPos] = useState(0); // Store scroll position
  
  // Initialize posts immediately with Fallback data
  const [posts, setPosts] = useState<Post[]>(() => {
    const initial = [...FALLBACK_POSTS];
    const adPost: Post = {
        id: 'ad-lingxi',
        title: '【官方】灵犀 - 跨越维度的共鸣',
        author: '灵犀助手',
        content: '文字有时候是冰冷的。在引擎轰鸣的间隙，是否渴望一个能听懂你频率的声音？',
        likes: 9999,
        commentsCount: 0,
        comments: [],
        time: '置顶',
        isAd: true
    };
    // Insert ad at index 12 so it is not visible on initial load
    initial.splice(12, 0, adPost);
    return initial;
  });

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Like feature state for detail view
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Ad State
  const [installProgress, setInstallProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Restore Scroll Position Logic
  useLayoutEffect(() => {
    if (view === ViewState.FORUM_LIST) {
      window.scrollTo(0, scrollPos);
    } else {
      window.scrollTo(0, 0);
    }
  }, [view]); // Dependencies: restore when view changes back to list

  // Handle Post Click
  const handlePostClick = (post: Post) => {
    // Save scroll position before leaving list view
    setScrollPos(window.scrollY);

    if (post.isAd) {
      setView(ViewState.AD_LANDING);
    } else {
      setSelectedPost(post);
      // Reset like state for the new post
      setIsLiked(false);
      setLikeCount(post.likes);
      setView(ViewState.FORUM_POST);
    }
  };

  // Handle Like Click
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Handle Install Simulation
  const handleDownloadClick = () => {
    setView(ViewState.AD_INSTALL);
    setInstallProgress(0);
  };

  useEffect(() => {
    if (view === ViewState.AD_INSTALL) {
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setView(ViewState.APP_LOGIN), 800);
            return 100;
          }
          return prev + 1.5; 
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [view]);

  // Handle Login Confirm
  const handleLoginConfirm = () => {
    if (!userName.trim()) return;
    setView(ViewState.APP_CHAT);
    setTimeout(() => {
      setChatHistory([{ id: '1', sender: 'bot', text: '你好' }]);
    }, 800);
  };

  // --- Render Views ---

  // 1. Forum List (NGA Style)
  if (view === ViewState.FORUM_LIST) {
    return (
      <div className={`min-h-screen ${THEME.bodyBg} max-w-md mx-auto shadow-2xl relative pb-8`}>
        <Header title="摩托迷 NGA" />
        
        {/* Sub-header / Breadcrumbs simulation */}
        <div className="bg-[#F8F0D6] border-b border-[#E0D0B0] px-4 py-2 text-xs text-[#665544] flex justify-between">
            <span> 论坛 &gt; 摩托车交流区</span>
            <span>今日: {posts.length}</span>
        </div>

        <div className="px-2 pt-2">
        {posts.map((post) => (
            <div 
            key={post.id} 
            onClick={() => handlePostClick(post)}
            className={`${THEME.postBg} mb-2 p-3 active:brightness-95 transition-all cursor-pointer border ${THEME.postBorder} rounded-sm shadow-sm ${post.isAd ? 'border-l-4 border-l-black bg-white' : ''}`}
            >
            {/* Title Line */}
            <div className="mb-2">
                <h3 className={`text-[15px] font-medium leading-tight ${post.isAd ? 'text-black font-bold' : 'text-[#2D1B1B]'}`}>
                    {post.title}
                </h3>
            </div>

            {/* Meta Info */}
            <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                    {post.isAd ? (
                       <span className="bg-black text-white text-[10px] px-1 py-0.5 rounded-sm">推广</span>
                    ) : (
                       <span className="text-[#897365] bg-[#EFE8D3] px-1 rounded-sm">{post.author}</span>
                    )}
                    <span className="text-[#998877]">{post.time}</span>
                </div>
                
                {post.isAd ? (
                   <div className="flex items-center text-black font-bold text-xs">
                     <span className="mr-1">点击查看</span> <ChevronRight size={12}/>
                   </div>
                ) : (
                    <div className="flex items-center gap-3 text-[#998877]">
                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentsCount}</span>
                    </div>
                )}
            </div>
            
            {post.isAd && (
                 <p className="text-xs text-gray-500 mt-2 line-clamp-1 border-t border-gray-100 pt-2">{post.content}</p>
            )}

            </div>
        ))}
        <div className="text-center text-[#998877] text-xs py-4">已经到底啦 ~</div>
        </div>
      </div>
    );
  }

  // 2. Post Detail (NGA Style + Like Animation)
  if (view === ViewState.FORUM_POST && selectedPost) {
    return (
      <div className={`min-h-screen ${THEME.bodyBg} max-w-md mx-auto shadow-2xl relative flex flex-col`}>
        <Header title="帖子详情" showBack onBack={() => setView(ViewState.FORUM_LIST)} />
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Main Post */}
          <div className={`${THEME.postBg} p-4 border-b ${THEME.postBorder}`}>
             <h1 className="text-lg font-bold text-[#333333] mb-3 leading-snug">{selectedPost.title}</h1>
             
             <div className="flex items-center gap-3 mb-4 border-b border-[#F0E6D2] pb-3">
                <div className="w-10 h-10 bg-[#E0D6C0] rounded flex items-center justify-center text-[#58140C] font-bold text-lg border border-[#D0C0A0]">
                    {selectedPost.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#58140C]">{selectedPost.author}</div>
                  <div className="text-xs text-[#998877]">楼主 • {selectedPost.time}</div>
                </div>
             </div>
             
             <div className="text-[15px] text-[#333333] leading-7 whitespace-pre-wrap min-h-[100px]">
                {selectedPost.content}
             </div>

             {/* Like Button Section */}
             <div className="flex justify-end mt-6">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded border transition-all duration-300 ${
                        isLiked 
                        ? 'bg-[#58140C] text-white border-[#58140C]' 
                        : 'bg-white text-[#58140C] border-[#58140C] hover:bg-[#FFF5F5]'
                    }`}
                >
                    <div className={`${isLiked ? 'scale-125' : 'scale-100'} transition-transform duration-300`}>
                       <ThumbsUp size={16} className={isLiked ? 'fill-white' : ''} />
                    </div>
                    <span className="text-sm font-bold">赞 {likeCount}</span>
                </button>
             </div>
          </div>

          {/* Comments Section */}
          <div className="bg-[#F4E8D1] px-4 py-2 text-sm font-bold text-[#6D5645] border-b border-[#E0D0B0] shadow-inner">
            全部评论 ({selectedPost.comments?.length || 0})
          </div>
          
          <div className="pb-16">
            {selectedPost.comments?.map((comment, index) => (
              <div key={comment.id} className={`${THEME.postBg} p-3 border-b ${THEME.postBorder} flex gap-3`}>
                <div className="w-8 h-8 bg-[#EFE8D3] rounded-sm flex-shrink-0 flex items-center justify-center text-[#887766] text-xs font-bold border border-[#E0D0B0]">
                    {index + 1}L
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="text-sm font-bold text-[#58140C]">{comment.author}</span>
                    <span className="text-[10px] text-[#998877]">{comment.time}</span>
                  </div>
                  <p className="text-sm text-[#333333] leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input Bar */}
        <div className={`border-t ${THEME.postBorder} p-3 bg-[#FFFAEE] flex items-center gap-2 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]`}>
            <input type="text" placeholder="回复楼主..." className="flex-1 bg-white border border-[#D0C0A0] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#58140C] text-[#333333]" />
            <button className="bg-[#58140C] text-white p-2 rounded-sm shadow-sm hover:bg-[#4a110a]"><Send size={18} /></button>
        </div>
      </div>
    );
  }

  // 3. Ad Landing (Level 2) - Black Theme - AI Voice
  if (view === ViewState.AD_LANDING) {
    return (
      <div className="min-h-screen bg-black max-w-md mx-auto shadow-2xl relative flex flex-col text-white overflow-hidden font-sans">
        {/* Abstract Background Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-zinc-800/30 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black to-transparent z-10"></div>

        <button 
          onClick={() => setView(ViewState.FORUM_LIST)} 
          className="absolute top-6 left-6 z-30 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20">
            <div className="space-y-16 w-full text-center">
                <div className="animate-fade-in-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] mb-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                        <AudioLines size={40} className="text-white relative z-10" />
                    </div>
                    
                    <h1 className="text-4xl font-extralight tracking-[0.2em] mb-3 text-white">灵犀</h1>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em]">Neural Resonance</p>
                </div>
                
                <div className="space-y-4 animate-fade-in-up delay-100">
                    <p className="text-xl font-light tracking-widest text-zinc-300">代码构筑躯壳</p>
                    <p className="text-xl font-light tracking-widest text-white">声音注入灵魂</p>
                </div>

                <div className="pt-8 animate-fade-in-up delay-200">
                    <button 
                        onClick={handleDownloadClick}
                        className="group relative inline-flex items-center justify-center px-12 py-4 text-xs font-bold tracking-[0.2em] text-black transition-all duration-500 bg-white rounded-full hover:bg-zinc-300 hover:scale-105 uppercase"
                    >
                        <span className="mr-2"><Sparkles size={12}/></span>
                        建立连接
                    </button>
                    <p className="mt-6 text-[10px] text-zinc-700 font-mono">Ver 3.0.1 // AI Voice Interface</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 4. Ad Install (Level 3) - Black Theme
  if (view === ViewState.AD_INSTALL) {
    return (
      <div className="min-h-screen bg-black max-w-md mx-auto shadow-2xl flex flex-col items-center justify-center p-10 text-white relative overflow-hidden">
         <div className="w-full max-w-[240px] text-center space-y-8 relative z-10">
            <div className="w-16 h-16 border border-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4 bg-zinc-900/50">
                <AudioLines size={24} className="text-zinc-500" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-sm font-light tracking-[0.2em] text-zinc-400 uppercase">System Sync</h2>
                <p className="text-xs text-zinc-600 font-mono">Downloading resources...</p>
            </div>
            
            <div className="relative pt-6">
                <div className="w-full h-[2px] bg-zinc-900 overflow-hidden rounded-full">
                    <div 
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-100 ease-linear"
                        style={{ width: `${installProgress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-3 font-mono text-[10px] text-zinc-600">
                    <span>00</span>
                    <span>{Math.floor(installProgress)}</span>
                    <span>100</span>
                </div>
            </div>
         </div>
      </div>
    );
  }

  // 5. App Login (Level 4) - Black Theme
  if (view === ViewState.APP_LOGIN) {
    return (
      <div className="min-h-screen bg-black max-w-md mx-auto shadow-2xl flex flex-col items-center justify-center p-8 animate-fade-in font-sans">
        <div className="w-full max-w-xs space-y-12">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-6">
                    <span className="text-black font-bold text-lg">灵</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-widest">身份确认</h2>
                <p className="text-xs text-zinc-600 tracking-wide">请输入您的称呼，以便灵犀识别</p>
            </div>

            <div className="space-y-6">
                <div className="relative group">
                    <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="NAME" 
                        className="w-full bg-transparent border-b border-zinc-800 text-white px-4 py-4 focus:outline-none focus:border-white transition-all text-center placeholder-zinc-800 tracking-[0.2em] text-sm"
                    />
                </div>
                <button 
                    onClick={handleLoginConfirm}
                    disabled={!userName.trim()}
                    className={`w-full py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 ${
                        userName.trim() ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                    }`}
                >
                    进入终端
                </button>
            </div>
        </div>
      </div>
    );
  }

  // 6. App Chat (Level 5) - Black Theme
  if (view === ViewState.APP_CHAT) {
    return (
      <div className="min-h-screen bg-black max-w-md mx-auto shadow-2xl relative flex flex-col text-zinc-200 font-sans">
         {/* Minimalist Header */}
         <div className="h-16 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center px-6 justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white ring-1 ring-zinc-700">
                    <AudioLines size={14} />
                </div>
                <div>
                    <div className="font-medium text-white text-sm tracking-wide">灵犀</div>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="text-[10px] text-zinc-500 tracking-wider uppercase">Active</span>
                    </div>
                </div>
            </div>
            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
               <User size={18} />
            </button>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-black">
            <div className="flex justify-center my-4">
                <span className="text-[10px] text-zinc-800 font-mono border border-zinc-900 px-2 py-1 rounded">
                    SESSION START {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
            
            {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                         <div className="w-8 h-8 mr-3 bg-zinc-900 border border-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center text-zinc-400">
                            <span className="font-serif italic text-xs">L</span>
                         </div>
                    )}
                    <div className={`max-w-[75%] px-5 py-3 text-sm font-light leading-relaxed tracking-wide ${
                        msg.sender === 'user' 
                        ? 'bg-zinc-100 text-black rounded-2xl rounded-tr-sm' 
                        : 'bg-zinc-900 text-zinc-300 rounded-2xl rounded-tl-sm border border-zinc-800'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
         </div>

         {/* Minimalist Input Area */}
         <div className="bg-black p-4 border-t border-zinc-900 flex items-center gap-4 pb-8">
            <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Mic size={18} />
            </button>
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-full px-5 py-3 flex items-center gap-2">
                <input 
                    disabled
                    type="text" 
                    placeholder="输入或按住说话..." 
                    className="flex-1 bg-transparent text-sm text-zinc-400 placeholder-zinc-700 focus:outline-none" 
                />
            </div>
            <button disabled className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black opacity-80 hover:opacity-100">
                <Send size={16} />
            </button>
         </div>
      </div>
    );
  }

  return null;
}