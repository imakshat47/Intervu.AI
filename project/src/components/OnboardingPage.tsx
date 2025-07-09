import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Camera, Mic, CheckCircle, ArrowRight, HelpCircle, User, Building, FileText, CameraOff, MicOff
} from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { JobDetails, TechnicalSetup } from '../types';

interface OnboardingPageProps {
  jobDetails: JobDetails;
  onJobDetailsChange: (details: JobDetails) => void;
  resumeFile: File | null;
  onResumeUpload: (file: File) => void;
  technicalSetup: TechnicalSetup;
  onTechnicalSetupChange: (setup: TechnicalSetup) => void;
  onContinue: () => void;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, label, icon, isLoading = false }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md">
    <div className="flex items-center space-x-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
        enabled 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow' 
          : 'bg-gray-100 text-gray-400'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-base font-medium text-gray-900">{label}</p>
        <p className={`text-xs font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
          {isLoading ? 'Enabling...' : enabled ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-1">
      <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
        enabled ? 'bg-green-500 shadow' : 'bg-gray-300'
      }`}></div>
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          enabled 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow' 
            : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow ${
            enabled ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  jobDetails,
  onJobDetailsChange,
  resumeFile,
  onResumeUpload,
  technicalSetup,
  onTechnicalSetupChange,
  onContinue
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [micLoading, setMicLoading] = useState(false);

  // Camera stream ref so we can always stop the correct stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Progress calculation
  const step1Complete = jobDetails.role && jobDetails.company;
  const step2Complete = resumeFile !== null;
  const step3Complete = technicalSetup.cameraEnabled && technicalSetup.micEnabled;
  const completedSteps = [step1Complete, step2Complete, step3Complete].filter(Boolean).length;
  const progress = (completedSteps / 3) * 100;

  // Camera live preview effect with cleanup
  useEffect(() => {
    if (technicalSetup.cameraEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(error => {
          console.error('Error accessing camera:', error);
          streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
        });
    } else {
      // Stop camera immediately if it exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    // Always clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [technicalSetup.cameraEnabled]);

  // Drag & drop handlers for resume
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onResumeUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onResumeUpload(e.target.files[0]);
    }
  };

  // Toggle camera enable/disable
  const toggleCamera = async () => {
    if (technicalSetup.cameraEnabled) {
      // Will trigger cleanup in useEffect above
      onTechnicalSetupChange({
        ...technicalSetup,
        cameraEnabled: false,
        cameraPermission: 'pending',
      });
      return;
    }
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      onTechnicalSetupChange({
        ...technicalSetup,
        cameraEnabled: true,
        cameraPermission: 'granted',
      });
    } catch {
      onTechnicalSetupChange({
        ...technicalSetup,
        cameraEnabled: false,
        cameraPermission: 'denied',
      });
    } finally {
      setCameraLoading(false);
    }
  };

  // Toggle microphone enable/disable
  const toggleMicrophone = async () => {
    if (technicalSetup.micEnabled) {
      onTechnicalSetupChange({
        ...technicalSetup,
        micEnabled: false,
        micPermission: 'pending',
      });
      return;
    }
    setMicLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      onTechnicalSetupChange({
        ...technicalSetup,
        micEnabled: true,
        micPermission: 'granted',
      });
    } catch {
      onTechnicalSetupChange({
        ...technicalSetup,
        micEnabled: false,
        micPermission: 'denied',
      });
    } finally {
      setMicLoading(false);
    }
  };

  const canContinue = step1Complete && step2Complete && step3Complete;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-600 flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto px-2 py-4">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-gray-700">{Math.round(progress)}% Complete</span>
            <span className="text-base font-semibold text-gray-700">Step {Math.min(completedSteps + 1, 3)} of 3</span>
          </div>
          <ProgressBar progress={progress} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
            Personalize Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Interview
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Help us create the perfect interview experience tailored for you
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Step 1: Job Details */}
          <div className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow border transition-all duration-500 hover:shadow-lg ${
            step1Complete
              ? 'border-green-300 ring-2 ring-green-100 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-blue-200 hover:border-blue-300 hover:bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold mr-3 transition-all duration-300 ${
                step1Complete
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow'
              }`}>
                {step1Complete ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">Job Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="flex items-center text-base font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Role
                </label>
                <select
                  value={jobDetails.role}
                  onChange={(e) => onJobDetailsChange({ ...jobDetails, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base font-medium transition-all bg-white hover:border-gray-300"
                >
                  <option value="">Select a role</option>
                  <option value="Algorithm Engineer">Algorithm Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                </select>
              </div>
              <div>
                <label className="flex items-center text-base font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4 mr-2 text-purple-600" />
                  Company
                </label>
                <select
                  value={jobDetails.company}
                  onChange={(e) => onJobDetailsChange({ ...jobDetails, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-base font-medium transition-all bg-white hover:border-gray-300"
                >
                  <option value="">Select a company</option>
                  <option value="Meta (Facebook)">Meta (Facebook)</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Apple">Apple</option>
                  <option value="Netflix">Netflix</option>
                </select>
              </div>
              <div>
                <label className="flex items-center text-base font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  Job Description
                </label>
                <textarea
                  value={jobDetails.jobDescription}
                  onChange={(e) => onJobDetailsChange({ ...jobDetails, jobDescription: e.target.value })}
                  placeholder="Paste the job description here..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none text-base transition-all bg-white hover:border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {jobDetails.jobDescription.length}/500 characters
                </p>
              </div>
            </div>
            {step1Complete && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-base font-bold text-green-800">Job details complete</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Upload Resume */}
          <div className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow border transition-all duration-500 hover:shadow-lg ${
            step2Complete
              ? 'border-green-300 ring-2 ring-green-100 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-blue-200 hover:border-blue-300 hover:bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold mr-3 transition-all duration-300 ${
                step2Complete
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow'
              }`}>
                {step2Complete ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">Upload Resume</h3>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : resumeFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`w-10 h-10 mx-auto mb-2 transition-all duration-300 ${
                resumeFile ? 'text-green-500' : 'text-gray-400'
              }`} />
              <p className="text-base text-gray-700 mb-2 font-semibold">
                Drag & drop or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-bold underline decoration-2 underline-offset-2">
                  browse
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
            </div>
            {resumeFile && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <div className="flex-1">
                    <p className="text-base font-bold text-green-800">{resumeFile.name}</p>
                    <p className="text-xs text-green-600 font-medium">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Camera & Mic */}
          <div className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow border transition-all duration-500 hover:shadow-lg ${
            step3Complete
              ? 'border-green-300 ring-2 ring-green-100 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-blue-200 hover:border-blue-300 hover:bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold mr-3 transition-all duration-300 ${
                step3Complete
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow'
              }`}>
                {step3Complete ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">Camera & Mic</h3>
            </div>
            <div className="space-y-3 mb-4">
              {/* Camera Toggle */}
              <ToggleSwitch
                enabled={technicalSetup.cameraEnabled}
                onToggle={toggleCamera}
                label="Camera"
                icon={technicalSetup.cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                isLoading={cameraLoading}
              />
              {/* Microphone Toggle */}
              <ToggleSwitch
                enabled={technicalSetup.micEnabled}
                onToggle={toggleMicrophone}
                label="Microphone"
                icon={technicalSetup.micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                isLoading={micLoading}
              />
            </div>
            {/* Live Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 mb-2">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                {technicalSetup.cameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                    muted
                  />
                ) : (
                  <div className="text-center w-full">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-gray-400 text-sm font-medium">Live Preview</p>
                  </div>
                )}
                {/* Status indicators */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  <div className={`w-2 h-2 rounded-full ${technicalSetup.cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${technicalSetup.micEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
            {step3Complete && (
              <div className="mb-2 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-base font-bold text-green-800">Technical setup complete</span>
                </div>
              </div>
            )}
            <div className="text-center">
              <a href="#" className="text-blue-600 hover:text-blue-700 text-base font-semibold flex items-center justify-center group">
                <HelpCircle className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform" />
                Need help? Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {canContinue && (
          <div className="text-center mt-2">
            <Button
              onClick={onContinue}
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Continue to Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
