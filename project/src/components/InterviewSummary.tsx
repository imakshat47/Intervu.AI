import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, Briefcase, Building, FileText, Camera, Mic, Edit, Zap, Play, CameraOff, MicOff } from 'lucide-react';
import { Button } from './Button';
import { JobDetails, TechnicalSetup } from '../types';

interface InterviewSummaryProps {
  jobDetails: JobDetails;
  resumeFile: File | null;
  technicalSetup: TechnicalSetup;
  onEditSetup: () => void;
  onStartInterview: () => void;
}

export const InterviewSummary: React.FC<InterviewSummaryProps> = ({
  jobDetails,
  resumeFile,
  technicalSetup,
  onEditSetup,
  onStartInterview
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (technicalSetup.cameraEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setVideoStream(null);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        });
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      setVideoStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup on unmount or when camera disabled
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [technicalSetup.cameraEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-600">
      <div className="max-w-3xl mx-auto px-3 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            Interview{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Summary
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-snug font-light">
            Review your personalized interview setup before we begin
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Interview Details</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition duration-200">
                <Briefcase className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Role</p>
                  <p className="text-xl font-semibold text-gray-900">{jobDetails.role}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-200 transition duration-200">
                <Building className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-0.5">Company</p>
                  <p className="text-xl font-semibold text-gray-900">{jobDetails.company}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-200 transition duration-200">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-0.5">Resume</p>
                  <p className="text-xl font-semibold text-gray-900 truncate max-w-xs">
                    {resumeFile?.name || 'No file uploaded'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/50">
            <div className="flex items-center mb-5">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Technical Setup</h2>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
                <div className="flex items-center">
                  {technicalSetup.cameraEnabled ? (
                    <Camera className="w-6 h-6 text-blue-600 mr-3" />
                  ) : (
                    <CameraOff className="w-6 h-6 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Camera</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {technicalSetup.cameraEnabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full shadow ${
                  technicalSetup.cameraEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-100">
                <div className="flex items-center">
                  {technicalSetup.micEnabled ? (
                    <Mic className="w-6 h-6 text-red-600 mr-3" />
                  ) : (
                    <MicOff className="w-6 h-6 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-0.5">Microphone</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {technicalSetup.micEnabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full shadow ${
                  technicalSetup.micEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-2 mb-4">
              <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                {technicalSetup.cameraEnabled && videoStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-base font-semibold">Live Preview</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className={`w-3 h-3 rounded-full ${technicalSetup.cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className={`w-3 h-3 rounded-full ${technicalSetup.micEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center font-semibold">
              {technicalSetup.cameraEnabled && technicalSetup.micEnabled 
                ? 'Your camera and microphone are working properly'
                : 'Please enable camera and microphone to continue'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            onClick={onEditSetup}
            icon={Edit}
            size="md"
            className="px-8 py-2 text-base font-semibold border"
          >
            Edit Setup
          </Button>
          <Button
            onClick={onStartInterview}
            size="md"
            icon={Play}
            className="px-12 py-2 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow hover:shadow-green-500/25 transform hover:scale-105 transition duration-200"
          >
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
};
