import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, 
  Globe, Radio, Sparkles, X, AlertCircle 
} from 'lucide-react';
import { dbService } from '../lib/db';

export const AudioAnnouncementPlayer = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [language, setLanguage] = useState('english'); // 'english' | 'hindi'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasAutoplayAttempted, setHasAutoplayAttempted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef(null);

  // Load announcement from DB & listen for live updates
  const loadAnnouncement = async () => {
    try {
      const data = await dbService.getAudioAnnouncement();
      setAnnouncement(data);
      setAudioError(false);
    } catch (e) {
      console.warn('Failed to load audio announcement:', e);
    }
  };

  useEffect(() => {
    loadAnnouncement();

    const handleUpdate = () => {
      loadAnnouncement();
    };

    window.addEventListener('awas_audio_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('awas_audio_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Determine current active audio URL based on language selection
  const currentAudioUrl = language === 'english'
    ? announcement?.english_audio_url
    : announcement?.hindi_audio_url;

  // Handle Autoplay safely per modern browser policies
  useEffect(() => {
    if (!announcement || !announcement.is_enabled || hasAutoplayAttempted || !currentAudioUrl) return;

    if (announcement.autoplay && audioRef.current) {
      setHasAutoplayAttempted(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            // Autoplay was blocked by browser policy without user interaction
            console.log('Autoplay deferred until user interaction:', err.message);
            setIsPlaying(false);
          });
      }
    }
  }, [announcement, currentAudioUrl, hasAutoplayAttempted]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setAudioError(false);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(seekTime)) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioError(false);
          })
          .catch((err) => {
            console.warn('Audio playback error:', err);
            setAudioError(true);
          });
      }
    }
  };

  const handleLanguageChange = (lang) => {
    if (lang === language) return;
    setLanguage(lang);
    setAudioError(false);

    // If currently playing, resume with new language stream after source changes
    if (isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }, 150);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec === Infinity) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If announcement is disabled by admin or not available, do not render
  if (!announcement || !announcement.is_enabled) {
    return null;
  }

  // Floating Minimized Bar
  if (isMinimized) {
    return (
      <aside 
        aria-label="Audio Announcement"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 9990,
          backgroundColor: '#0F2754',
          color: '#ffffff',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}
      >
        <audio
          ref={audioRef}
          src={currentAudioUrl}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => setAudioError(true)}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '3px 8px', borderRadius: '9999px', flexShrink: 0 }}>
            <Radio style={{ width: '13px', height: '13px', color: isPlaying ? '#4ADE80' : '#93C5FD', animation: isPlaying ? 'pulse 1.5s infinite' : 'none' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#93C5FD' }}>
              {language === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
            </span>
          </div>

          <span style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#E2E8F0', maxWidth: '350px' }}>
            🔊 {announcement.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              backgroundColor: '#2563EB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? <Pause style={{ width: '13px', height: '13px' }} /> : <Play style={{ width: '13px', height: '13px', marginLeft: '1px' }} />}
          </button>

          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#93C5FD' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            title="Expand player"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Expand</span>
            <ChevronDown style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      </aside>
    );
  }

  // Full Expanded Prominent Player (Top of Page)
  return (
    <aside 
      aria-label="Official Audio Announcement"
      style={{
        position: 'relative',
        zIndex: 9990,
        backgroundColor: '#0E244D',
        backgroundImage: 'linear-gradient(90deg, #0E244D 0%, #153874 50%, #0E244D 100%)',
        color: '#ffffff',
        borderBottom: '2px solid #2563EB',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '10px 16px'
      }}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Row 1: Title, Live Pill, Language Toggle & Minimize */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(37, 99, 235, 0.3)', border: '1px solid rgba(147, 197, 253, 0.3)', padding: '3px 10px', borderRadius: '9999px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: isPlaying ? '#22C55E' : '#F59E0B', boxShadow: isPlaying ? '0 0 8px #22C55E' : 'none' }}></span>
              <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', color: '#BFDBFE', textTransform: 'uppercase' }}>
                {isPlaying ? 'Now Playing' : 'Official Announcement'}
              </span>
            </div>

            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔊</span>
              <span>{announcement.title}</span>
            </h2>
          </div>

          {/* Right Controls: Language Selector & Minimize */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Language Switcher Pills */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#07152E', padding: '3px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              <button
                type="button"
                onClick={() => handleLanguageChange('english')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: language === 'english' ? '#2563EB' : 'transparent',
                  color: language === 'english' ? '#ffffff' : '#94A3B8',
                  transition: 'all 0.15s'
                }}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange('hindi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: language === 'hindi' ? '#2563EB' : 'transparent',
                  color: language === 'hindi' ? '#ffffff' : '#94A3B8',
                  transition: 'all 0.15s'
                }}
              >
                <span>🇮🇳</span>
                <span>हिंदी</span>
              </button>
            </div>

            {/* Minimize / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize audio bar"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#CBD5E1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronUp style={{ width: '13px', height: '13px' }} />
              <span className="hidden sm:inline">Minimize</span>
            </button>

          </div>

        </div>

        {/* Row 2: Player Controls & Timeline Scrubber */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1D4ED8',
              hoverBackgroundColor: '#2563EB',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              flexShrink: 0,
              transition: 'background-color 0.15s'
            }}
          >
            {isPlaying ? (
              <>
                <Pause style={{ width: '14px', height: '14px' }} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play style={{ width: '14px', height: '14px', marginLeft: '1px' }} />
                <span>Play Announcement</span>
              </>
            )}
          </button>

          {/* Timeline Progress Bar / Scrubber */}
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#93C5FD', minWidth: '38px' }}>
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flexGrow: 1,
                height: '5px',
                borderRadius: '9999px',
                accentColor: '#3B82F6',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
            />

            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#CBD5E1', minWidth: '38px' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={toggleMute}
              style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: '2px' }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX style={{ width: '16px', height: '16px', color: '#F87171' }} />
              ) : (
                <Volume2 style={{ width: '16px', height: '16px' }} />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: '70px',
                height: '4px',
                borderRadius: '9999px',
                accentColor: '#3B82F6',
                cursor: 'pointer'
              }}
            />
          </div>

        </div>

        {/* Error Notice if Audio fails */}
        {audioError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#FCA5A5', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '6px' }}>
            <AlertCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} />
            <span>Audio stream is initializing or audio file unavailable for {language}. You can switch languages or upload a new audio file in Admin.</span>
          </div>
        )}

      </div>
    </aside>
  );
};
