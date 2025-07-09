import React from 'react';
import { PartyPopper, FileText, RotateCcw } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface CompletionModalProps {
  isOpen: boolean;
  onViewReport: () => void;
  onRetakeInterview: () => void;
  onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onViewReport,
  onRetakeInterview,
  onClose
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center space-y-6">
        {/* Celebration Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <PartyPopper className="w-10 h-10 text-blue-600" />
        </div>

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
          <p className="text-lg text-gray-600">
            You have successfully completed your interview session.
          </p>
        </div>

        {/* Message */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800">
            Ready to see how you did? View your detailed interview report now.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onViewReport}
            size="lg"
            icon={FileText}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            View Report
          </Button>
          <Button
            onClick={onRetakeInterview}
            variant="outline"
            size="lg"
            icon={RotateCcw}
            className="flex-1"
          >
            Retake Interview
          </Button>
        </div>
      </div>
    </Modal>
  );
};