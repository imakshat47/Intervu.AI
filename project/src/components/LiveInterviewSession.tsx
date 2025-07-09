import React, { useState, useRef, useEffect } from 'react';
import {
  Circle, Settings, Camera, Mic, Volume2, SkipForward, Send, LogOut, Play, Pause,
} from 'lucide-react';
import { Button } from './Button';
import { JobDetails, Question } from '../types';
import { formatTime } from '../utils';

interface LiveInterviewSessionProps {
  jobDetails: JobDetails;
  questions: Question[];
  onSubmitAnswer: (questionId: string, answer: string) => void;
  onCompleteInterview: () => void;
  onLeaveSession: () => void;
}

export const LiveInterviewSession: React.FC<LiveInterviewSessionProps> = ({
  jobDetails,
  questions,
  onSubmitAnswer,
  onCompleteInterview,
  onLeaveSession,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [userSpeakingTime, setUserSpeakingTime] = useState(0);
  const [aiSpeakingTime, setAiSpeakingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // TTS
  const [isReading, setIsReading] = useState(false);

  // STT (mic)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // CAMERA: Open/Close video stream
  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        setVideoStream(stream);
      }).catch(() => setVideoStream(null));
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
    }
    // Clean up when component unmounts
    return () => {
      if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line
  }, [isRecording]);

  // Always assign srcObject and play after stream is set
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(() => {});
    }
    if (videoRef.current && !videoStream) {
      videoRef.current.srcObject = null;
    }
  }, [videoStream]);

  // Session timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
      if (isRecording) setUserSpeakingTime((prev) => prev + 1);
      else setAiSpeakingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  // --- MIC (Speech-to-Text) ---
  const handleMicClick = () => {
    // Supported?
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current && recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    let appendedTranscript = currentAnswer;
    const resetSilenceTimeout = () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
      }, 5000); // 5 sec silence auto-stop
    };
    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimeout();
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          appendedTranscript += (appendedTranscript ? ' ' : '') + transcript;
        } else {
          interim = transcript;
        }
      }
      setCurrentAnswer(appendedTranscript + interim);
      resetSilenceTimeout();
    };
    recognition.onerror = () => {
      setIsListening(false);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- TTS (Text-to-Speech) ---
  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }
    const utter = new window.SpeechSynthesisUtterance(currentQuestion?.text || '');
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => setIsReading(false);
    utter.onstart = () => setIsReading(true);
    window.speechSynthesis.cancel(); // stop any previous
    window.speechSynthesis.speak(utter);
  };

  // --- Interview Logic ---
  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      onSubmitAnswer(currentQuestion.id, currentAnswer);
      setCurrentAnswer('');
      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((prev) => prev + 1);
      else onCompleteInterview();
    }
  };
  const handleSkipQuestion = () => {
    setCurrentAnswer('');
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((prev) => prev + 1);
    else onCompleteInterview();
  };
  const toggleRecording = () => setIsRecording((prev) => !prev);
  const togglePause = () => setIsPaused((prev) => !prev);

  // --- UI ---
  return (
    <div className="h-screen min-h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Circle className="w-3 h-3 text-red-500 fill-current animate-pulse" />
            <span className="font-semibold text-gray-700">Live Session</span>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-medium">User Speaking:</span>
              <span className="font-mono font-bold text-blue-600 ml-1">{formatTime(userSpeakingTime)}</span>
            </div>
            <div>
              <span className="font-medium">AI Speaking:</span>
              <span className="font-mono font-bold text-purple-600 ml-1">{formatTime(aiSpeakingTime)}</span>
            </div>
            <div>
              <span className="font-medium">Total:</span>
              <span className="font-mono font-bold text-gray-900 ml-1">{formatTime(sessionTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={isPaused ? Play : Pause}
            onClick={togglePause}
            className="text-gray-600"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="ghost" size="sm" icon={Settings} className="text-gray-600" />
          <Button
            onClick={onCompleteInterview}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Final Submit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onLeaveSession}
            icon={LogOut}
            className="font-semibold"
          >
            Leave Session
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-grow w-full h-full overflow-hidden">
        <div
          className="grid gap-8 w-full h-full px-8 py-8"
          style={{
            gridTemplateColumns: '340px 1.8fr 1.8fr',
            height: '100%',
            minHeight: 0,
          }}
        >
          {/* Left Panel - Live Video & Info */}
          <div className="flex flex-col items-center h-full">
            <div
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-stretch h-full"
              style={{
                width: '340px',
                minWidth: '240px',
                maxWidth: '370px',
                margin: '0 auto',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ marginTop: '-10px', marginBottom: '10px' }}>
                <div
                  className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ minHeight: 0, height: 170 }}
                >
                  {isRecording && videoStream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-xl"
                      style={{ background: 'black' }}
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg font-medium">Live Video</p>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <Circle className="w-2 h-2 fill-current animate-pulse" />
                      <span>REC</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col" style={{ marginTop: '70px' }}>
                <div className="mb-4 flex items-center justify-between px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 w-full">
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">ROLE</span>
                  <span className="text-lg font-bold text-gray-900">{jobDetails.role}</span>
                </div>
                <div className="mb-4 flex items-center justify-between px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 w-full">
                  <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">COMPANY</span>
                  <span className="text-lg font-bold text-gray-900">{jobDetails.company}</span>
                </div>
                <div className="mb-4 flex items-center justify-between px-4 py-2 bg-green-50 rounded-xl border border-green-100 w-full">
                  <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">QUESTION</span>
                  <span className="text-lg font-bold text-gray-900">
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 w-full">
                  <span className="text-sm font-semibold text-orange-600 uppercase tracking-wide">TIME</span>
                  <span className="text-lg font-bold text-gray-900 font-mono">{formatTime(sessionTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Current Question */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Current Question</h2>
              <button
                onClick={handleReadAloud}
                className={`transition-all duration-200 ${
                  isReading ? 'bg-purple-100 text-purple-600 ring-4 ring-purple-200 animate-pulse' : ''
                } p-2 rounded-full`}
                title={isReading ? 'Stop Reading' : 'Read Question'}
              >
                <Volume2 className="w-7 h-7" />
              </button>
            </div>
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4 border border-blue-200">
                {currentQuestion?.category}
              </div>
              <p className="text-xl text-gray-900 leading-relaxed mb-4 font-medium">
                {currentQuestion?.text}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span className="font-medium">Difficulty: {currentQuestion?.difficulty}</span>
                <span className="font-medium">Question {currentQuestionIndex + 1}/{questions.length}</span>
              </div>
            </div>
            <div className="flex justify-center mt-auto">
              <Button
                variant="outline"
                onClick={handleSkipQuestion}
                icon={SkipForward}
                iconPosition="right"
                className="px-6 py-3 font-semibold border-2"
              >
                Skip Question
              </Button>
            </div>
          </div>

          {/* Right Panel - Your Answer */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Answer</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleMicClick}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isListening
                      ? 'bg-green-100 text-green-600 ring-4 ring-green-200 animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Use speech-to-text"
                >
                  <Mic className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isRecording
                      ? 'bg-red-100 text-red-600 ring-4 ring-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle Camera"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-grow flex flex-col">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Click the microphone to start recording, or type your answer here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg leading-relaxed flex-1"
                style={{ minHeight: 0, maxHeight: 180 }}
              />
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim()}
                className="w-full py-3 mt-2 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                icon={Send}
                iconPosition="right"
              >
                Submit Answer
              </Button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
