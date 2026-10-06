import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// 🚀 Cloudinary URL Optimizer (ভিডিওর সাইজ ৬০% কমিয়ে রকেটের গতিতে লোড করবে)
const optimizeUrl = (url) => {
  if (!url) return "";
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
};

const VideoCard = ({ vid, index, activeIndex, scrollToVideo, globalMute, toggleGlobalMute }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [liked, setLiked] = useState(false);

  const isActive = index === activeIndex;
  
  // 🚀 Smart Pre-loading: একসাথে ৫৫০০ ভিডিও লোড না করে, শুধু ইউজারের আশেপাশের ৩টা ভিডিও মেমরিতে রাখবে!
  const isNearActive = Math.abs(index - activeIndex) <= 2;

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log("Autoplay prevented:", err));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video when swiped away
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      // 🚀 Global Mute Fix: ভিডিওতে ট্যাপ করলে সাউন্ড আসবে, আবার ট্যাপ করলে পজ হবে
      if (globalMute) {
        toggleGlobalMute(); // Unmute everywhere
      } else {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
      if (navigator.vibrate) navigator.vibrate(50); 
    }
  };

  // 🚀 Double Tap to Like
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setLiked(true);
    setShowHeart(true);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setTimeout(() => setShowHeart(false), 1000);
  };

  // 🚀 Native Web Share API
  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: vid.title,
          text: 'Check out this awesome Shorts!',
          url: vid.original_url || vid.video_url,
        });
      } catch (err) { console.log('Share canceled'); }
    } else {
      alert("Sharing not supported on this browser. Link copied!");
      navigator.clipboard.writeText(vid.original_url || vid.video_url);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const enablePiP = async (e) => {
    e.stopPropagation();
    if (videoRef.current && document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  return (
    <div id={`video-${index}`} className="h-screen w-full snap-start flex flex-col items-center justify-center relative py-4">
      <div className="relative flex flex-col items-center">
        
        {/* 🚀 Dynamic Ambient Background */}
        <div className={`neon-border-wrapper w-[340px] h-[600px] md:w-[380px] md:h-[680px] mb-6 transition-all duration-700 shadow-[0_0_${isActive ? '40px' : '20px'}_${vid.source === 'tiktok' ? 'rgba(255,20,147,0.4)' : 'rgba(34,211,238,0.4)'}]`}>
          <div 
            className="neon-inner flex flex-col relative overflow-hidden bg-black group rounded-2xl cursor-pointer h-full" 
            onClick={togglePlay}
            onDoubleClick={handleDoubleClick}
          >
            
            {/* 🚀 Mobile Black Screen Fixed + Auto Size Video */}
            {isNearActive && (
              <>
                {/* 🚀 Premium Blurred Background */}
                <video
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-3xl scale-125 z-0"
                  src={optimizeUrl(vid.video_url)} 
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                
                {/* 🚀 Auto-Size Main Video (object-contain) */}
                <video
                  ref={videoRef}
                  className="relative w-full h-full object-contain z-10"
                  src={optimizeUrl(vid.video_url)} 
                  loop
                  muted={globalMute} 
                  playsInline
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                />
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>

            {/* Tap to Unmute / Play Icon */}
            {(!isPlaying || globalMute) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-4xl border border-white/20 pl-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {globalMute ? "🔇" : "▶"}
                </div>
              </div>
            )}

            {/* 🚀 Animated Big Heart on Double Tap */}
            {showHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                <div className="text-9xl text-pink-500 drop-shadow-[0_0_30px_rgba(255,20,147,1)] animate-bounce scale-150 transition-transform duration-300">
                  ❤
                </div>
              </div>
            )}

            <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-5 items-center pointer-events-auto">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-pink-500 overflow-hidden mb-2 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.title}`} alt="avatar" />
              </div>

              <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition" onClick={handleDoubleClick}>
                <div className={`text-3xl drop-shadow-[0_0_15px_rgba(255,20,147,1)] ${liked ? 'text-pink-500' : 'text-white'}`}>❤</div>
                <span className="text-xs text-white mt-1 font-bold">{liked ? '440K' : '439K'}</span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition">
                <div className="text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">💬</div>
                <span className="text-xs text-white mt-1 font-bold">456</span>
              </div>
              <div onClick={enablePiP} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition" title="Picture in Picture">
                <div className="text-2xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]">🔲</div>
              </div>
              <div onClick={handleShare} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition">
                <div className="text-3xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,1)]">↗️</div>
                <span className="text-xs text-white mt-1 font-bold">Share</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-5 right-20 z-20 pointer-events-none">
              <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-[0_0_10px_rgba(34,211,238,0.8)] text-white ${vid.source === 'tiktok' ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
                  {vid.source === 'tiktok' ? 'TikTok' : 'YouTube'}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md">
                  #{vid.tags && vid.tags.length > 0 ? vid.tags[0] : 'Trending'}
                </span>
              </div>
              <h2 className="text-white font-bold text-sm md:text-[15px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,1)] line-clamp-2">
                {vid.title}
              </h2>
            </div>
            
            {/* 🚀 Custom Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-20">
               <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-100" style={{ width: `${progress}%` }}></div>
            </div>

          </div>
        </div>
        <div className="podium absolute -bottom-5"></div>
      </div>
    </div>
  );
};

export default function App() {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tik Shorts');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 🚀 New States for Advanced Features
  const [globalMute, setGlobalMute] = useState(true);
  const [activeHashtag, setActiveHashtag] = useState('All');
  const [visibleCount, setVisibleCount] = useState(10); // Infinite Scroll limits
  const [watchHistory, setWatchHistory] = useState(() => JSON.parse(localStorage.getItem('shortsHistory') || '[]'));

  const rains = useMemo(() => Array.from({ length: 40 }).map(() => ({ left: `${Math.random() * 100}vw`, animationDuration: `${Math.random() * 1 + 0.5}s`, animationDelay: `${Math.random() * 2}s` })), []);
  const fireflies = useMemo(() => Array.from({ length: 20 }).map(() => ({ left: `${Math.random() * 100}vw`, top: `${Math.random() * 100}vh`, animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random() * 2}s` })), []);
  const butterflies = useMemo(() => Array.from({ length: 5 }).map(() => ({ left: `${Math.random() * 100}vw`, top: `${Math.random() * 100}vh`, animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `${Math.random() * 3}s` })), []);

  useEffect(() => {
    fetch('https://shortstube-api.onrender.com/api/videos', {
      method: 'GET',
      headers: { 'x-api-key': 'ShortsTube_Pro_Max_Secret_2026', 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => { 
        const videoArray = data.videos ? data.videos : data;
        setAllVideos(videoArray.reverse()); 
        setLoading(false); 
      })
      .catch(err => { console.error("Error:", err); setLoading(false); });
  }, []);

  // 🚀 Filter logic based on Tab AND Hashtag
  const filteredVideos = allVideos.filter(vid => {
    let sourceMatch = false;
    if (activeTab === 'Tik Shorts') sourceMatch = vid.source === 'tiktok';
    if (activeTab === 'You Shorts') sourceMatch = vid.source === 'youtube';
    
    let tagMatch = activeHashtag === 'All' ? true : (vid.title.toLowerCase().includes(activeHashtag.toLowerCase()));
    return sourceMatch && tagMatch;
  });

  // 🚀 Infinite Scroll slice (Render only what's needed)
  const displayedVideos = filteredVideos.slice(0, visibleCount);

  // 🚀 Track Watch History
  useEffect(() => {
    if (displayedVideos.length > 0 && activeIndex >= 0) {
      const currentVid = displayedVideos[activeIndex];
      const vidId = currentVid._id || currentVid.original_url;
      if (vidId && !watchHistory.includes(vidId)) {
        const newHistory = [...watchHistory, vidId];
        setWatchHistory(newHistory);
        localStorage.setItem('shortsHistory', JSON.stringify(newHistory));
      }
      
      // Infinite Scroll Trigger: Load more if nearing the end
      if (activeIndex >= visibleCount - 3) {
        setVisibleCount(prev => prev + 10);
      }
    }
  }, [activeIndex, displayedVideos, visibleCount]);

  const scrollToVideo = useCallback((index) => {
    if (index >= 0 && index < filteredVideos.length) {
      document.getElementById(`video-${index}`).scrollIntoView({ behavior: 'smooth' });
      setActiveIndex(index);
    }
  }, [filteredVideos.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollToVideo(activeIndex + 1); } 
      else if (e.key === 'ArrowUp') { e.preventDefault(); scrollToVideo(activeIndex - 1); } 
      else if (e.key === ' ') {
        e.preventDefault();
        setGlobalMute(prev => !prev); // Spacebar unmutes/mutes
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToVideo]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.id.split('-')[1]);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll('[id^="video-"]').forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [displayedVideos]);

  return (
    <div className="nature-bg relative w-full h-screen overflow-hidden flex font-sans">
      
      <div className="absolute inset-0 pointer-events-none z-0">
        {rains.map((style, i) => <div key={`rain-${i}`} className="rain" style={style}></div>)}
        {fireflies.map((style, i) => <div key={`firefly-${i}`} className="firefly" style={style}></div>)}
        {butterflies.map((style, i) => <div key={`butterfly-${i}`} className="butterfly" style={style}></div>)}
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 pointer-events-auto">
        <button onClick={() => scrollToVideo(activeIndex - 1)} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-2xl hover:bg-white/30 hover:scale-110 transition flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">▲</button>
        <button onClick={() => scrollToVideo(activeIndex + 1)} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-2xl hover:bg-white/30 hover:scale-110 transition flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">▼</button>
      </div>

      <div className="hidden md:flex flex-col w-[280px] h-full glass-panel z-10 p-6">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-12 tracking-wide drop-shadow-[0_0_15px_rgba(255,105,180,0.9)]">
          ShortsTube
        </h1>
        
        {/* 🚀 Hashtag Filtering */}
        <div className="mb-6 flex gap-2 flex-wrap">
           <span onClick={() => {setActiveHashtag('All'); setActiveIndex(0)}} className={`px-3 py-1 rounded-full text-xs text-white border border-white/20 cursor-pointer hover:bg-white/30 transition ${activeHashtag === 'All' ? 'bg-white/30 font-bold' : 'bg-white/10'}`}>🌐 All</span>
           <span onClick={() => {setActiveHashtag('Trending'); setActiveIndex(0)}} className={`px-3 py-1 rounded-full text-xs text-white border border-white/20 cursor-pointer hover:bg-white/30 transition ${activeHashtag === 'Trending' ? 'bg-pink-500/50' : 'bg-white/10'}`}>🔥 Trending</span>
           <span onClick={() => {setActiveHashtag('Funny'); setActiveIndex(0)}} className={`px-3 py-1 rounded-full text-xs text-white border border-white/20 cursor-pointer hover:bg-white/30 transition ${activeHashtag === 'Funny' ? 'bg-cyan-500/50' : 'bg-white/10'}`}>😂 Funny</span>
        </div>

        <nav className="flex flex-col gap-6">
          <div onClick={() => { setActiveTab('Tik Shorts'); setActiveHashtag('All'); setActiveIndex(0); setVisibleCount(10); }} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition transform hover:scale-105 ${activeTab === 'Tik Shorts' ? 'bg-[#1e293b]/60 border border-pink-400 shadow-[0_0_15px_rgba(255,105,180,0.5),inset_0_0_10px_rgba(255,105,180,0.3)] text-white' : 'text-gray-300 hover:text-white'}`}>
            <span className="text-pink-400 text-2xl drop-shadow-[0_0_10px_rgba(255,105,180,1)]">🎵</span>
            <span className="font-bold text-[15px] tracking-wide">Tik Shorts</span>
          </div>
          <div onClick={() => { setActiveTab('You Shorts'); setActiveHashtag('All'); setActiveIndex(0); setVisibleCount(10); }} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition transform hover:scale-105 ${activeTab === 'You Shorts' ? 'bg-[#1e293b]/60 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5),inset_0_0_10px_rgba(34,211,238,0.3)] text-white' : 'text-gray-300 hover:text-white'}`}>
            <span className="text-cyan-400 text-2xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">▶</span>
            <span className="font-bold text-[15px] tracking-wide">You Shorts</span>
          </div>
        </nav>
        
        {/* Shows Watch History Count */}
        <div className="mt-auto text-white/50 text-xs text-center pb-4">
          Videos Watched: {watchHistory.length}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth z-10 [&::-webkit-scrollbar]:hidden pointer-events-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-3xl font-bold text-cyan-400 animate-pulse">Loading...</div>
        ) : displayedVideos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="glass-panel p-8 rounded-2xl border border-white/20 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h2 className="text-2xl font-bold text-white mb-2">No Videos Found!</h2>
            </div>
          </div>
        ) : (
          displayedVideos.map((vid, index) => (
            <VideoCard 
              key={index} 
              index={index} 
              activeIndex={activeIndex} 
              vid={vid} 
              scrollToVideo={scrollToVideo}
              globalMute={globalMute}
              toggleGlobalMute={() => setGlobalMute(!globalMute)}
            />
          ))
        )}
      </div>
    </div>
  );
}