import React, { useState, useEffect } from 'react';
import { Music, Heart, TrendingUp, Calendar, Play, Pause, BarChart3, Settings, User, Plus, List, MessageCircle, Sparkles, Brain, Trophy, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MoodTuneApp = () => {
  const [currentPage, setCurrentPage] = useState('mood');
  const [moodData, setMoodData] = useState({
    happiness: 50,
    anxiety: 30,
    energy: 60,
    stress: 40
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [quickMoodSelected, setQuickMoodSelected] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [moodHistory, setMoodHistory] = useState([
    { date: '7/19', happiness: 65, anxiety: 25, energy: 70, stress: 30, note: '工作順利' },
    { date: '7/20', happiness: 45, anxiety: 60, energy: 40, stress: 70, note: '考試壓力' },
    { date: '7/21', happiness: 70, anxiety: 20, energy: 80, stress: 25, note: '週末放鬆' },
    { date: '7/22', happiness: 55, anxiety: 35, energy: 65, stress: 45, note: '普通的一天' },
    { date: '7/23', happiness: 80, anxiety: 15, energy: 85, stress: 20, note: '朋友聚會' },
    { date: '7/24', happiness: 60, anxiety: 30, energy: 70, stress: 35, note: '運動後' },
    { date: '7/25', happiness: 50, anxiety: 30, energy: 60, stress: 40, note: '今天的心情' }
  ]);

  // 歡迎詞庫
  const welcomeMessages = [
    { text: "今天也是充滿可能性的一天！讓音樂陪伴你的每一刻 🎵", type: "勵志" },
    { text: "記住，每個情緒都是暫時的，但音樂能讓美好的感受延續 ✨", type: "勵志" },
    { text: "歡迎回來！準備好用音樂調節你的心情了嗎？", type: "歡迎" },
    { text: "無論今天心情如何，都有適合你的音樂在等待 🎧", type: "溫馨" },
    { text: "每一次聆聽，都是與自己內心的對話 💝", type: "哲理" },
    { text: "音樂是情緒的良藥，讓我們一起找到今天的配方 🌈", type: "治療" }
  ];

  // 四類音樂庫
  const musicCategories = {
    uplifting: {
      name: "振奮類",
      color: "bg-yellow-100 border-yellow-300",
      tracks: [
        { id: 1, title: "Sunshine Melody", artist: "Happy Vibes", duration: "3:24", mood: "振奮" },
        { id: 2, title: "Upbeat Journey", artist: "Energy Flow", duration: "4:12", mood: "振奮" },
        { id: 3, title: "Positive Waves", artist: "Mood Lifter", duration: "3:45", mood: "振奮" },
        { id: 4, title: "Bright Day", artist: "Sunny Sounds", duration: "4:01", mood: "振奮" }
      ]
    },
    calming: {
      name: "平靜類",
      color: "bg-blue-100 border-blue-300",
      tracks: [
        { id: 5, title: "Ocean Breeze", artist: "Calm Waters", duration: "5:20", mood: "平靜" },
        { id: 6, title: "Peaceful Mind", artist: "Zen Garden", duration: "6:15", mood: "平靜" },
        { id: 7, title: "Soft Whispers", artist: "Tranquil Space", duration: "4:33", mood: "平靜" },
        { id: 8, title: "Inner Peace", artist: "Meditation Flow", duration: "7:02", mood: "平靜" }
      ]
    },
    energizing: {
      name: "活力類",
      color: "bg-green-100 border-green-300",
      tracks: [
        { id: 9, title: "Power Surge", artist: "Dynamic Beat", duration: "3:58", mood: "活力" },
        { id: 10, title: "Focus Flow", artist: "Concentration", duration: "4:27", mood: "活力" },
        { id: 11, title: "Energy Boost", artist: "Vitality", duration: "3:39", mood: "活力" },
        { id: 12, title: "Active Mind", artist: "Peak Performance", duration: "4:15", mood: "活力" }
      ]
    },
    therapeutic: {
      name: "療癒類",
      color: "bg-purple-100 border-purple-300",
      tracks: [
        { id: 13, title: "Healing Light", artist: "Therapy Sounds", duration: "6:45", mood: "療癒" },
        { id: 14, title: "Emotional Release", artist: "Recovery Path", duration: "5:30", mood: "療癒" },
        { id: 15, title: "Stress Relief", artist: "Wellness Wave", duration: "7:18", mood: "療癒" },
        { id: 16, title: "Soul Repair", artist: "Inner Healing", duration: "5:55", mood: "療癒" }
      ]
    }
  };

  // 快速心情選項
  const quickMoodOptions = [
    {
      emoji: '😊',
      label: '開心',
      mood: { happiness: 80, anxiety: 20, energy: 75, stress: 25 },
      message: "太好了！讓我們用音樂延續這份快樂！"
    },
    {
      emoji: '😔',
      label: '低落',
      mood: { happiness: 25, anxiety: 45, energy: 35, stress: 60 },
      message: "沒關係，音樂會陪伴你度過低潮期"
    },
    {
      emoji: '😰',
      label: '焦慮',
      mood: { happiness: 35, anxiety: 80, energy: 50, stress: 75 },
      message: "深呼吸，讓平靜的音樂幫助你放鬆"
    },
    {
      emoji: '😌',
      label: '平靜',
      mood: { happiness: 65, anxiety: 15, energy: 55, stress: 20 },
      message: "很棒的狀態！讓音樂保持這份寧靜"
    },
    {
      emoji: '😴',
      label: '疲憊',
      mood: { happiness: 40, anxiety: 35, energy: 20, stress: 55 },
      message: "給自己一些溫柔的音樂休息一下"
    },
    {
      emoji: '🔥',
      label: '充滿活力',
      mood: { happiness: 75, anxiety: 25, energy: 90, stress: 30 },
      message: "活力滿滿！來點動感音樂吧！"
    }
  ];

  // 推薦算法
  const calculateMusicScores = (mood) => {
    const scores = {};
    scores.uplifting = Math.max(0, 100 - mood.happiness) * 0.6 + (mood.energy < 50 ? (50 - mood.energy) * 0.4 : 0);
    scores.calming = mood.anxiety * 0.7 + (mood.stress > 50 ? (mood.stress - 50) * 0.3 : 0);
    scores.energizing = Math.max(0, 70 - mood.energy) * 0.8 + (mood.happiness > 60 ? (mood.happiness - 60) * 0.2 : 0);
    scores.therapeutic = mood.stress * 0.5 + mood.anxiety * 0.3 + Math.max(0, 40 - mood.happiness) * 0.2;
    return scores;
  };

  const generatePlaylist = (mood) => {
    const scores = calculateMusicScores(mood);
    const sortedCategories = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const playlist = [];
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    sortedCategories.forEach(([category, score]) => {
      const percentage = score / totalScore;
      let songCount = Math.max(1, Math.round(percentage * 8));
      const categoryTracks = musicCategories[category].tracks;
      const selectedTracks = categoryTracks.slice(0, songCount);
      playlist.push(...selectedTracks);
    });

    return playlist;
  };

  // 溫和的情緒觀察
  const gentleEmotionalReflection = () => {
    const recent = moodHistory.slice(-7);
    const avgHappiness = recent.reduce((sum, day) => sum + day.happiness, 0) / recent.length;
    const avgAnxiety = recent.reduce((sum, day) => sum + day.anxiety, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, day) => sum + day.energy, 0) / recent.length;
    const avgStress = recent.reduce((sum, day) => sum + day.stress, 0) / recent.length;

    let insights = [''];
    let recommendations = [''];

    if (avgHappiness < 40) {
      insights.push("🌱 這段時間心情比較沉重，這很正常，每個人都會有這樣的時期");
      recommendations.push("溫柔地對待自己，也許可以嘗試一些讓心情舒緩的活動");
    } else if (avgHappiness > 70) {
      insights.push("✨ 最近的日子充滿溫暖，真為你感到開心");
      recommendations.push("繼續珍惜這些美好時光，讓正能量慢慢沉澱");
    }

    if (avgAnxiety > 60) {
      insights.push("🤗 感受到你內心的不安，焦慮是身體在保護你的表現");
      recommendations.push("試著深呼吸，給自己一些溫柔的時間和空間");
    }

    if (avgEnergy < 40) {
      insights.push("💤 最近感覺有點疲憊，身體在告訴你需要休息");
      recommendations.push("聽從身體的聲音，適當的休息是自我關愛的表現");
    }

    if (avgStress > 60) {
      insights.push("🌊 感受到生活帶來的壓力，這份沉重感被看見了");
      recommendations.push("試著放慢腳步，每一個小小的放鬆都很珍貴");
    }

    return {
      insights: insights.filter(i => i !== ''),
      recommendations: recommendations.filter(r => r !== ''),
      averages: { avgHappiness, avgAnxiety, avgEnergy, avgStress }
    };
  };

  const handleMoodChange = (type, value) => {
    setMoodData(prev => ({ ...prev, [type]: value }));
  };

  const handleQuickMoodSelect = (moodOption) => {
    setMoodData(moodOption.mood);
    setQuickMoodSelected(moodOption);

    // 自動生成播放清單
    const playlist = generatePlaylist(moodOption.mood);
    const newPlaylist = {
      id: Date.now(),
      name: `${moodOption.label}心情播放清單`,
      tracks: playlist,
      createdAt: new Date().toLocaleString('zh-TW'),
      mood: moodOption.label
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    setCurrentPlaylist(newPlaylist);

    setTimeout(() => setQuickMoodSelected(null), 3000);
  };

  const createCustomPlaylist = () => {
    const playlist = generatePlaylist(moodData);
    const newPlaylist = {
      id: Date.now(),
      name: `自訂播放清單 ${new Date().toLocaleDateString('zh-TW')}`,
      tracks: playlist,
      createdAt: new Date().toLocaleString('zh-TW'),
      mood: '自訂'
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    setCurrentPlaylist(newPlaylist);
  };

  const saveMoodEntry = () => {
    const today = new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
    const note = prompt('想為今天的心情留個小記憶嗎？（完全可選）') || '今天的心情記錄';

    setMoodHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        date: today,
        ...moodData,
        note: note
      };
      return updated;
    });

    // 移除社交壓力的分享功能，改為溫和的確認
    const encouragingMessages = [
      "💝 你的感受被溫柔地記錄下來了",
      "🌱 每一次記錄都是對自己的關愛",
      "✨ 謝謝你願意傾聽內心的聲音",
      "🤗 你今天的感受很重要，被好好珍藏了"
    ];
    
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    alert(`${randomMessage}\n\n今天的音樂建議：${moodData.anxiety > 60 ? '來點療癒的聲音吧' : moodData.happiness < 40 ? '也許需要一些溫暖的陪伴' : '跟著心情選擇喜歡的音樂'}`);
  };

  // 滑桿組件優化
  const ImprovedMoodSlider = ({ label, type, value, color, icon }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <label className="text-gray-700 font-medium">{label}</label>
          </div>
          <span className={`px-3 py-2 rounded-lg text-sm font-bold ${color} min-w-[60px] text-center`}>
            {value}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => handleMoodChange(type, parseInt(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
              isDragging ? 'scale-105 shadow-lg' : 'hover:scale-102'
            }`}
            style={{
              background: `linear-gradient(to right,
                ${color.includes('yellow') ? '#fef3c7' :
                  color.includes('red') ? '#fee2e2' :
                  color.includes('green') ? '#dcfce7' : '#e0e7ff'} 0%,
                ${color.includes('yellow') ? '#f59e0b' :
                  color.includes('red') ? '#ef4444' :
                  color.includes('green') ? '#10b981' : '#6366f1'} ${value}%,
                #e5e7eb ${value}%, #e5e7eb 100%)`
            }}
          />
          <div
            className={`absolute top-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 transition-all duration-200 ${
              isDragging ? 'scale-125' : 'hover:scale-110'
            } ${color.replace('text-', 'bg-').replace('100', '500')}`}
            style={{ left: `calc(${value}% - 12px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    );
  };

  const radarData = [
    { mood: '快樂', value: moodData.happiness },
    { mood: '能量', value: moodData.energy },
    { mood: '平靜', value: 100 - moodData.anxiety },
    { mood: '放鬆', value: 100 - moodData.stress }
  ];

  useEffect(() => {
    setTimeout(() => setShowWelcome(false), 5000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blue-50 to-lavender-50" style={{fontFamily: 'Inter, SF UI Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'}}>

      {/* 歡迎訊息 */}
      {showWelcome && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-white/90 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-full shadow-soft border border-white/50 flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-sm">{welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)].text}</span>
          </div>
        </div>
      )}

      {/* 快速心情選擇通知 */}
      {quickMoodSelected && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white border-2 border-green-300 text-green-800 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{quickMoodSelected.emoji}</span>
              <div>
                <div className="font-semibold">{quickMoodSelected.message}</div>
                <div className="text-sm">已為你建立專屬播放清單！</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-soft border-0">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-rose-300 to-blue-300 p-3 rounded-2xl shadow-soft">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-700 tracking-wide">
                MoodTune
              </h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage('mood')}
                className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'mood' ? 'bg-rose-100 text-rose-600 shadow-soft' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage('music')}
                className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'music' ? 'bg-blue-100 text-blue-600 shadow-soft' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
              >
                <Music className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage('playlists')}
                className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'playlists' ? 'bg-purple-100 text-purple-600 shadow-soft' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'analytics' ? 'bg-amber-100 text-amber-600 shadow-soft' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-600'}`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* 心情輸入頁面 */}
        {currentPage === 'mood' && (
          <div className="space-y-6">

            {/* 快速心情選擇 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/50">
              <h3 className="font-medium text-slate-700 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-amber-400" />
                快速心情選擇
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {quickMoodOptions.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMoodSelect(mood)}
                    className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white/60 to-slate-50/40 hover:from-rose-50/70 hover:to-blue-50/70 border border-white/70 hover:border-rose-200/50 transition-all duration-500 hover:shadow-soft hover:-translate-y-1"
                  >
                    <span className="text-4xl mb-3">{mood.emoji}</span>
                    <span className="text-sm font-medium text-slate-600">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                詳細心情調整
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ImprovedMoodSlider
                    label="快樂程度"
                    type="happiness"
                    value={moodData.happiness}
                    color="bg-yellow-100 text-yellow-800"
                    icon={<Heart className="w-4 h-4 text-yellow-500" />}
                  />
                  <ImprovedMoodSlider
                    label="焦慮程度"
                    type="anxiety"
                    value={moodData.anxiety}
                    color="bg-red-100 text-red-800"
                    icon={<TrendingUp className="w-4 h-4 text-red-500" />}
                  />
                  <ImprovedMoodSlider
                    label="能量水平"
                    type="energy"
                    value={moodData.energy}
                    color="bg-green-100 text-green-800"
                    icon={<Sparkles className="w-4 h-4 text-green-500" />}
                  />
                  <ImprovedMoodSlider
                    label="壓力指數"
                    type="stress"
                    value={moodData.stress}
                    color="bg-blue-100 text-blue-800"
                    icon={<Target className="w-4 h-4 text-blue-500" />}
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">情緒雷達圖</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="mood" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="當前情緒"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={saveMoodEntry}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>溫柔記錄今天的心情</span>
                </button>
                <button
                  onClick={createCustomPlaylist}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>建立播放清單</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 播放清單頁面 */}
        {currentPage === 'playlists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <List className="w-5 h-5 mr-2 text-green-500" />
                我的播放清單
              </h2>

              {playlists.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">還沒有播放清單</p>
                  <button
                    onClick={() => setCurrentPage('mood')}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    記錄心情建立清單
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {playlists.map(playlist => (
                    <div key={playlist.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">{playlist.name}</h3>
                        <span className="text-xs text-gray-500">{playlist.createdAt}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {playlist.tracks.slice(0, 3).map(track => (
                          <div key={track.id} className="flex items-center space-x-3 text-sm">
                            <Play className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{track.title}</span>
                            <span className="text-gray-500">- {track.artist}</span>
                          </div>
                        ))}
                        {playlist.tracks.length > 3 && (
                          <p className="text-xs text-gray-500">還有 {playlist.tracks.length - 3} 首歌曲...</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {playlist.mood}心情
                        </span>
                        <button
                          onClick={() => setCurrentPlaylist(playlist)}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors"
                        >
                          播放
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 當前播放清單 */}
            {currentPlaylist && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-4">正在播放：{currentPlaylist.name}</h3>
                <div className="space-y-3">
                  {currentPlaylist.tracks.map(track => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setCurrentSong(track);
                            setIsPlaying(!isPlaying);
                          }}
                          className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors"
                        >
                          {isPlaying && currentSong?.id === track.id ?
                            <Pause className="w-4 h-4" /> :
                            <Play className="w-4 h-4" />
                          }
                        </button>
                        <div>
                          <h4 className="font-medium text-gray-800">{track.title}</h4>
                          <p className="text-sm text-gray-600">{track.artist} • {track.duration}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{track.mood}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 音樂推薦頁面 */}
        {currentPage === 'music' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Music className="w-5 h-5 mr-2 text-blue-500" />
                音樂庫
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(musicCategories).map(([key, category]) => (
                  <div key={key} className={`${category.color} rounded-xl p-6 border-2`}>
                    <h3 className="font-semibold text-gray-800 mb-4">{category.name}</h3>
                    <div className="space-y-3">
                      {category.tracks.map(track => (
                        <div key={track.id} className="flex items-center justify-between bg-white bg-opacity-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setCurrentSong(track);
                                setIsPlaying(!isPlaying);
                              }}
                              className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
                            >
                              {isPlaying && currentSong?.id === track.id ?
                                <Pause className="w-4 h-4 text-gray-700" /> :
                                <Play className="w-4 h-4 text-gray-700" />
                              }
                            </button>
                            <div>
                              <h4 className="font-medium text-gray-800">{track.title}</h4>
                              <p className="text-sm text-gray-600">{track.artist}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 分析頁面 */}
        {currentPage === 'analytics' && (
          <div className="space-y-6">
            {/* 情緒趨勢 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                情緒趨勢分析
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="happiness"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="快樂程度"
                  />
                  <Line
                    type="monotone"
                    dataKey="anxiety"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="焦慮程度"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="能量水平"
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="壓力指數"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 溫和的情緒反思 */}
            {(() => {
              const reflection = gentleEmotionalReflection();
              return (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-purple-500" />
                    溫柔的心情觀察
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                        心情觀察
                      </h3>
                      <div className="space-y-3">
                        {reflection.insights.length > 0 ? reflection.insights.map((insight, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        )) : (
                          <div className="bg-white p-4 rounded-lg border border-purple-100">
                            <p className="text-gray-700">🌸 你的心情就像天氣一樣自然變化，每一種感受都很珍貴</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-green-500" />
                        溫柔提醒
                      </h3>
                      <div className="space-y-3">
                        {reflection.recommendations.length > 0 ? reflection.recommendations.map((rec, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-green-100">
                            <p className="text-gray-700">🌱 {rec}</p>
                          </div>
                        )) : (
                          <div className="bg-white p-4 rounded-lg border border-green-100">
                            <p className="text-gray-700">🌱 繼續用心感受每一天，你已經做得很好了</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 週平均數據 */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{Math.round(analysis.averages.avgHappiness)}</div>
                      <div className="text-sm text-gray-600">平均快樂度</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{Math.round(analysis.averages.avgAnxiety)}</div>
                      <div className="text-sm text-gray-600">平均焦慮度</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(analysis.averages.avgEnergy)}</div>
                      <div className="text-sm text-gray-600">平均能量度</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(analysis.averages.avgStress)}</div>
                      <div className="text-sm text-gray-600">平均壓力度</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTuneApp;
