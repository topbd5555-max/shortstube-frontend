import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

const optimizeUrl = (url) => {
  if (!url) return "";
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
};

// 1. Comment Bottom Sheet Component
const CommentDrawer = ({ isOpen, onClose }) => (
  <div className={`absolute bottom-0 left-0 w-full h-[60%] bg-gray-900/95 backdrop-blur-xl rounded-t-3xl z-50 transition-transform duration-500 border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
      <div className="w-12 h-1.5 bg-gray-500 rounded-full cursor-pointer hover:bg-white transition"></div>
    </div>
    <div className="p-4 text-white">
      <h3 className="text-lg font-bold mb-4">Comments (456)</h3>
      <div className="space-y-4 overflow-y-auto h-[250px] pr-2">
        {['This is amazing! 🔥', 'Pro developer spotted 💻', 'Next level UI 😍', 'Bhai crazy lagche!'].map((msg, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 shrink-0"></div>
            <div>
              <p className="text-xs text-gray-400 font-bold">User_{i+1}</p>
              <p className="text-sm">{msg}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <input type="text" placeholder="Add a comment..." className="w-full bg-gray-800 rounded-full px-4 py-2 text-sm outline-none border border-gray-700 focus:border-pink-500" />
        <button className="bg-pink-600 px-4 py-2 rounded-full font-bold">Post</button>
      </div>
    </div>
  </div>
);

// 2. Main Video Component
const VideoCard = ({ vid, index, activeIndex, scrollToVideo, globalMute, toggleGlobalMute, isAutoScroll }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [volumeHover, setVolumeHover] = useState(false);

  const isActive = index === activeIndex;
  const isNearActive = Math.abs(index - activeIndex) <= 2;

  // 3. Dynamic Theme (Based on source)
  const themeGlow = vid.source === 'tiktok' ? 'rgba(255,20,147,0.5)' : 'rgba(34,211,238,0.5)';
  const themeBorder = vid.source === 'tiktok' ? 'border-pink-500' : 'border-cyan-500';

  useEffect(() => {
    if (isActive && videoRef.current) {
      const savedTime = localStorage.getItem(`vidTime_${vid._id || index}`);
      if (savedTime && savedTime < videoRef.current.duration - 2) {
        videoRef.current.currentTime = parseFloat(savedTime);
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log(err));
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowComments(false);
    }
  }, [isActive, index, vid._id]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (globalMute) { toggleGlobalMute(); } 
      else {
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
        setIsPlaying(!isPlaying);
      }
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return; 
    if (videoRef.current) { videoRef.current.playbackRate = 2.0; setIsSpeeding(true); }
  };

  const handlePointerUp = () => {
    if (videoRef.current) { videoRef.current.playbackRate = 1.0; setIsSpeeding(false); }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation(); setLiked(true); setShowHeart(true);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setProgress((current / videoRef.current.duration) * 100);
      if (isActive && Math.floor(current) % 2 === 0) {
        localStorage.setItem(`vidTime_${vid._id || index}`, current);
      }
    }
  };

  const handleVideoEnded = () => {
    localStorage.removeItem(`vidTime_${vid._id || index}`);
    if (isAutoScroll) scrollToVideo(index + 1);
  };

  const handleLoadedMetadata = (e) => setIsLandscape(e.target.videoWidth >= e.target.videoHeight * 0.8);

  return (
    <div id={`video-${index}`} className="h-screen w-full snap-start flex flex-col items-center justify-center relative py-4 perspective-1000">
      <div className={`relative flex flex-col items-center transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-95 opacity-50 blur-sm'}`}>
        
        <div className={`neon-border-wrapper ${isLandscape ? 'w-[360px] h-[400px] md:w-[600px] md:h-[450px]' : 'w-[340px] h-[600px] md:w-[380px] md:h-[680px]'} mb-6 transition-all duration-500 rounded-2xl`} style={{ boxShadow: `0 0 ${isActive ? '40px' : '20px'} ${themeGlow}` }}>
          <div 
            className="neon-inner flex flex-col relative overflow-hidden bg-black group rounded-2xl cursor-pointer h-full" 
            onClick={togglePlay} onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
          >
            
            {isNearActive && (
              <>
                <video className="absolute inset-0 w-full h-full object-cover opacity-30 blur-3xl scale-125 z-0" src={optimizeUrl(vid.video_url)} autoPlay muted loop playsInline />
                <video
                  ref={videoRef}
                  className="relative w-full h-full object-contain z-10"
                  src={optimizeUrl(vid.video_url)} 
                  loop={!isAutoScroll} muted={globalMute} playsInline preload={isActive ? "auto" : "metadata"}
                  onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleVideoEnded} 
                />
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>

            {isSpeeding && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full z-40 text-white font-bold text-sm tracking-wider flex items-center gap-2 backdrop-blur-md animate-pulse">▶▶ 2x Speed</div>
            )}

            {(!isPlaying || globalMute) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-4xl border border-white/20 pl-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">{globalMute ? "🔇" : "▶"}</div>
              </div>
            )}

            {showHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"><div className="text-9xl text-pink-500 animate-ping scale-150 transition-transform duration-300">❤</div></div>
            )}

            <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-5 items-center pointer-events-auto">
              <div className={`w-10 h-10 bg-white rounded-full border-2 ${themeBorder} overflow-hidden mb-2 shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.title}`} alt="avatar" />
              </div>
              <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition" onClick={handleDoubleClick}>
                <div className={`text-3xl drop-shadow-[0_0_15px_rgba(255,20,147,1)] ${liked ? 'text-pink-500' : 'text-white'}`}>❤</div>
                <span className="text-xs text-white mt-1 font-bold">{liked ? '440K' : '439K'}</span>
              </div>
              
              {/* 4. Bottom Sheet Comment Trigger */}
              <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition" onClick={(e) => { e.stopPropagation(); setShowComments(true); }}>
                <div className="text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">💬</div>
                <span className="text-xs text-white mt-1 font-bold">456</span>
              </div>
              
              <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition">
                <div className="text-3xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,1)]">↗️</div>
                <span className="text-xs text-white mt-1 font-bold">Share</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-5 right-20 z-20 pointer-events-none">
              <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-[0_0_10px_${themeGlow}] text-white ${vid.source === 'tiktok' ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
                  {vid.source === 'tiktok' ? 'TikTok' : 'YouTube'}
                </span>
              </div>
              <h2 className="text-white font-bold text-sm md:text-[15px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,1)] line-clamp-2">{vid.title}</h2>
            </div>
            
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-20">
               <div className={`h-full transition-all duration-75 ${vid.source === 'tiktok' ? 'bg-pink-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }}></div>
            </div>

            <CommentDrawer isOpen={showComments} onClose={(e) => { e.stopPropagation(); setShowComments(false); }} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tik Shorts');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [globalMute, setGlobalMute] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10); 
  const [watchHistory, setWatchHistory] = useState(() => JSON.parse(localStorage.getItem('shortsHistory') || '[]'));
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  
  // 5. Wellbeing / Watch Time Tracker & Offline mode state
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const rains = useMemo(() => Array.from({ length: 40 }).map(() => ({ left: `${Math.random() * 100}vw`, animationDuration: `${Math.random() * 1 + 0.5}s`, animationDelay: `${Math.random() * 2}s` })), []);

  useEffect(() => {
    // 6. Register Service Worker for Offline 500 Videos
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => console.log('Offline Caching Active (SW Registered)'));
    }

    // Network Status Listeners
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));

    fetch('https://shortstube-api.onrender.com/api/videos', { headers: { 'x-api-key': 'ShortsTube_Pro_Max_Secret_2026' }})
      .then(res => res.json())
      .then(data => { 
        setAllVideos((data.videos ? data.videos : data).reverse()); 
        setLoading(false); 
      })
      .catch(err => { console.error("Error:", err); setLoading(false); });
      
    // Wellbeing Timer
    const timer = setInterval(() => setWatchSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayedVideos = allVideos.filter(vid => vid.source === (activeTab === 'Tik Shorts' ? 'tiktok' : 'youtube')).slice(0, visibleCount);

  const scrollToVideo = useCallback((index) => {
    if (index >= 0 && index < allVideos.length) {
      document.getElementById(`video-${index}`).scrollIntoView({ behavior: 'smooth' });
      setActiveIndex(index);
    }
  }, [allVideos.length]);

  // 7. Voice Control & Keyboard Pro Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollToVideo(activeIndex + 1); } 
      else if (e.key === 'ArrowUp') { e.preventDefault(); scrollToVideo(activeIndex - 1); } 
      else if (e.key === ' ' || e.key === 'm') { e.preventDefault(); setGlobalMute(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);

    // AI Voice Control Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (command.includes('next')) scrollToVideo(activeIndex + 1);
        if (command.includes('back') || command.includes('previous')) scrollToVideo(activeIndex - 1);
        if (command.includes('mute') || command.includes('play')) setGlobalMute(false);
      };
      recognition.start();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToVideo]);

  // 8. Intersection Observer + Infinite Scroll
  useEffect(() => {
    if (activeIndex >= visibleCount - 3) setVisibleCount(prev => prev + 10);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveIndex(Number(entry.target.id.split('-')[1])); });
    }, { threshold: 0.6 });
    document.querySelectorAll('[id^="video-"]').forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [displayedVideos, activeIndex, visibleCount]);

  return (
    <div className="nature-bg relative w-full h-screen overflow-hidden flex font-sans">
      <div className="absolute inset-0 pointer-events-none z-0">
        {rains.map((style, i) => <div key={`rain-${i}`} className="rain" style={style}></div>)}
      </div>

      {/* Offline Mode UI Warning */}
      {isOffline && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center py-1 text-xs font-bold z-[100] animate-pulse">
          ⚠️ You are offline. Playing cached videos!
        </div>
      )}

      {/* Watch Time Dashboard */}
      <div className="absolute bottom-4 left-4 z-50 text-white/50 text-[10px] font-bold font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
        ⏱ Session: {Math.floor(watchSeconds/60)}m {watchSeconds%60}s
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <span className="text-white text-xs font-bold tracking-wider">AUTO SCROLL</span>
        <div onClick={() => setIsAutoScroll(!isAutoScroll)} className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors duration-300 ${isAutoScroll ? 'bg-pink-500' : 'bg-gray-600'}`}>
          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-300 ${isAutoScroll ? 'translate-x-5' : 'translate-x-1'}`}></div>
        </div>
      </div>

      <div className="hidden md:flex flex-col w-[280px] h-full glass-panel z-10 p-6 relative">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-12 tracking-wide drop-shadow-[0_0_15px_rgba(255,105,180,0.5)]">ShortsTube</h1>
        
        {/* 9. Hashtag Analytics Chart Simulation */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 font-bold mb-2">TRENDING TAGS 📈</p>
          <div className="space-y-2">
            <div><div className="flex justify-between text-[10px] text-white"><span>#Funny</span><span>85%</span></div><div className="h-1.5 w-full bg-gray-700 rounded-full mt-1"><div className="h-full bg-cyan-400 rounded-full" style={{width: '85%'}}></div></div></div>
            <div><div className="flex justify-between text-[10px] text-white"><span>#Dance</span><span>60%</span></div><div className="h-1.5 w-full bg-gray-700 rounded-full mt-1"><div className="h-full bg-pink-400 rounded-full" style={{width: '60%'}}></div></div></div>
          </div>
        </div>

        <nav className="flex flex-col gap-6">
          <div onClick={() => { setActiveTab('Tik Shorts'); setActiveIndex(0); }} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition transform hover:scale-105 ${activeTab === 'Tik Shorts' ? 'bg-[#1e293b]/80 border border-pink-400 shadow-[0_0_15px_rgba(255,105,180,0.4)] text-white' : 'text-gray-400 hover:text-white'}`}>🎵 Tik Shorts</div>
          <div onClick={() => { setActiveTab('You Shorts'); setActiveIndex(0); }} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition transform hover:scale-105 ${activeTab === 'You Shorts' ? 'bg-[#1e293b]/80 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-white' : 'text-gray-400 hover:text-white'}`}>▶ You Shorts</div>
        </nav>
        
        {/* Pro Shortcuts Hint */}
        <div className="absolute bottom-6 left-6 text-xs text-gray-500 font-bold">
          ⌨ Shortcuts: (↑ ↓ Space M) <br/> 🎤 Try saying "Next"
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth z-10 [&::-webkit-scrollbar]:hidden pointer-events-auto relative">
        {loading ? (
          // 10. Neon Skeleton Loader
          <div className="h-full flex items-center justify-center">
             <div className="w-[340px] h-[600px] rounded-2xl border-2 border-gray-800 bg-gray-900/50 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                <div className="absolute bottom-20 right-4 space-y-4"><div className="w-10 h-10 bg-gray-700 rounded-full"></div><div className="w-10 h-10 bg-gray-700 rounded-full"></div></div>
                <div className="absolute bottom-6 left-4 w-40 h-4 bg-gray-700 rounded-full"></div>
             </div>
          </div>
        ) : (
          displayedVideos.map((vid, index) => (
            <VideoCard key={index} index={index} activeIndex={activeIndex} vid={vid} scrollToVideo={scrollToVideo} globalMute={globalMute} toggleGlobalMute={() => setGlobalMute(!globalMute)} isAutoScroll={isAutoScroll} />
          ))
        )}
      </div>
    </div>
  );
}