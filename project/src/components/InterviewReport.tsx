import React from 'react';
import { 
  ArrowLeft, 
  Download, 
  Star, 
  CheckCircle, 
  Archive,
  Calendar,
  Clock,
  Building,
  Briefcase
} from 'lucide-react';
import { Button } from './Button';
import { InterviewSession } from '../types';
import { formatTime, getRatingLabel } from '../utils';

interface InterviewReportProps {
  session: InterviewSession;
  onBack: () => void;
  onDownloadReport: () => void;
  onViewRepository: () => void;
}

export const InterviewReport: React.FC<InterviewReportProps> = ({
  session,
  onBack,
  onDownloadReport,
  onViewRepository
}) => {
  const ratingInfo = getRatingLabel(session.score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={ArrowLeft}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </Button>
          
          <Button
            onClick={onDownloadReport}
            icon={Download}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Interview Report</h1>
          <p className="text-xl text-gray-600">
            Comprehensive analysis and feedback from your interview session
          </p>
        </div>

        {/* Interview Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interview Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-900">{session.jobDetails.role}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Building className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{session.jobDetails.company}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {session.completedAt?.toLocaleDateString() || 'Today'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{formatTime(session.duration)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center space-x-4">
              <Star className="w-8 h-8 text-yellow-500 fill-current" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{session.score.toFixed(1)}/10</p>
                <p className={`text-lg font-semibold ${ratingInfo.color}`}>
                  {ratingInfo.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions & Responses */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Interview Questions & Responses
          </h2>
          
          <div className="space-y-6">
            {session.questions.map((question, index) => {
              const answer = session.answers.find(a => a.questionId === question.id);
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700 mb-4">{question.text}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Score:</span>
                      <span className="text-lg font-bold text-green-600">
                        {answer?.score}/10
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  {answer && (
                    <>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {answer.text}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">AI Feedback:</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {answer.feedback}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onDownloadReport}
            size="lg"
            icon={Download}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Export as PDF
          </Button>
          <Button
            onClick={onViewRepository}
            variant="outline"
            size="lg"
            icon={Archive}
          >
            Go to Interview Report Repository
          </Button>
        </div>
      </div>
    </div>
  );
};