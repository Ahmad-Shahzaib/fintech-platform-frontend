"use client";
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type DocumentFiles = {
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
};

type FormDataType = {
  fullName: string;
  dateOfBirth: string;
  residentialAddress: string;
  email: string;
  phoneNumber: string;
  issuingCountry: string;
  identityType: string;
  nationalIdNumber: string;
  documents: DocumentFiles;
  acceptTerms: boolean;
  verificationStatus: string;
};

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selfieMethod, setSelfieMethod] = useState('camera'); // 'camera' or 'upload'
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    residentialAddress: '',
    email: 'user@example.com', // Already collected at signup
    phoneNumber: '',

    // ID Verification
    issuingCountry: 'United States',
    identityType: 'PASSPORT',
    nationalIdNumber: '',
    
    // Documents
    documents: {
      idFront: null,
      idBack: null,
      selfie: null
    },
    
    // Terms
    acceptTerms: false,
    
    // Status
    verificationStatus: 'pending'
  });

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Effect to handle video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      // Assign the MediaStream to the video element
      try {
        (videoRef.current as HTMLVideoElement).srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      } catch (err) {
        console.error('Failed to attach stream to video element', err);
      }
    }
  }, [stream]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } as unknown as FormDataType));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof DocumentFiles) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: file
        }
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        verificationStatus: 'Pending Review'
      }));
      setCurrentStep(5);
    }, 2000);
    setCurrentStep(5);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Request camera access with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        } 
      });
      
      // Check if we got video tracks
      if (mediaStream.getVideoTracks().length === 0) {
        throw new Error('No video tracks found');
      }
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Set a timeout to check if video is playing
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState !== 4) {
          console.warn('Video not playing after timeout');
        }
      }, 1000);
      
    } catch (err: unknown) {
      console.error("Error accessing camera:", err);
      setCameraError((err as Error)?.message || "Could not access the camera");
      alert("Could not access the camera. Please check permissions and try again.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const captureSelfie = () => {
    const vid = videoRef.current;
    if (vid && vid.readyState === 4) {
      const canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Unable to capture image from camera.');
        return;
      }
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to capture image. Please try again.');
          return;
        }
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            selfie: file
          }
        }));
        closeCamera();
      }, "image/jpeg", 0.9);
    } else {
      alert('Camera not ready. Please wait a moment and try again.');
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">FinTech</span>
              <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">KYC</span>
            </div>
          </div>
         
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-6 pt-6 md:pt-8 pb-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex-1 ${idx > 0 ? 'mx-2' : ''}`}>
                  {idx > 0 && (
                    <div className={`h-0.5 ${currentStep > idx ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 ${idx < 4 ? 'mx-2' : ''}`}>
                  {idx < 4 && (
                    <div className={`h-0.5 ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2">
            <span className="text-xs text-gray-500">Personal Info</span>
            <span className="text-xs text-gray-500">ID Verification</span>
            <span className="text-xs text-gray-500">Selfie</span>
            <span className="text-xs text-gray-500">Review</span>
            <span className="text-xs text-gray-500">Status</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-8 pt-4 md:pt-6">
          {/* Step 1: Basic Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Personal Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Smith"
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="residentialAddress"
                      value={formData.residentialAddress}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Main Street, New York"
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email (already collected at signup)
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-3.5 bg-gray-100 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number (optional but recommended)
                    </label>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="w-full py-3.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Next Step</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: ID Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">ID Verification</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Issuing Country/Region
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <select 
                      name="issuingCountry"
                      value={formData.issuingCountry}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Select Identity Type
                  </label>
                  <p className="text-xs text-gray-400 mb-4">Should be your government issued photo identity</p>
                  
                  <div className="relative">
                    <select 
                      name="identityType"
                      value={formData.identityType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="PASSPORT">Passport</option>
                      <option value="NATIONAL ID">National ID Card</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Upload Documents
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block cursor-pointer">
                        <div className={`aspect-[5/3] bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all hover:bg-gray-100 ${formData.documents.idFront ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          {formData.documents.idFront ? (
                            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, 'idFront')}
                          accept="image/jpeg,image/png,application/pdf"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2 text-center">Front Side</p>
                    </div>
                    
                    {formData.identityType !== 'PASSPORT' && (
                      <div>
                        <label className="block cursor-pointer">
                          <div className={`aspect-[5/3] bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all hover:bg-gray-100 ${formData.documents.idBack ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                            {formData.documents.idBack ? (
                              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            )}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'idBack')}
                            accept="image/jpeg,image/png,application/pdf"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2 text-center">Back Side</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      ID Number
                    </label>
                    <input 
                      type="text" 
                      name="nationalIdNumber"
                      value={formData.nationalIdNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 1234 0256 8145"
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <button 
                  onClick={nextStep}
                  className="flex-1 py-3.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Next Step</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Selfie Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Selfie Verification</h2>
                
                {isCameraOpen ? (
                  <div className="space-y-6">
                    {cameraError ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Camera Error</h3>
                        <p className="text-red-600 mb-4">{cameraError}</p>
                        <button 
                          onClick={closeCamera}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Close Camera
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative bg-black rounded-2xl overflow-hidden" style={{ height: '400px' }}>
                          <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the video for selfie
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white border-dashed opacity-50"></div>
                          </div>
                          {!stream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="text-white text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p>Starting camera...</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                          <button 
                            onClick={closeCamera}
                            className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Cancel</span>
                          </button>
                          <button 
                            onClick={captureSelfie}
                            disabled={!stream}
                            className={`px-6 py-3 text-sm font-medium rounded-xl transition-colors flex items-center space-x-2 ${stream ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Capture</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center mb-8">
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6 overflow-hidden">
                      {formData.documents.selfie ? (
                        <img 
                          src={URL.createObjectURL(formData.documents.selfie)} 
                          alt="Selfie preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex justify-center space-x-4 mb-4">
                      <button
                        onClick={() => setSelfieMethod('camera')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selfieMethod === 'camera' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Take Selfie
                      </button>
                      <button
                        onClick={() => setSelfieMethod('upload')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selfieMethod === 'upload' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Upload Picture
                      </button>
                    </div>
                    
                    {selfieMethod === 'camera' ? (
                      <button
                        onClick={openCamera}
                        className="inline-block px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Open Camera
                      </button>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="inline-block px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors">
                          {formData.documents.selfie ? 'Change Selfie' : 'Choose File'}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, 'selfie')}
                          accept="image/jpeg,image/png"
                        />
                      </label>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-4">
                      {formData.documents.selfie 
                        ? 'Selfie uploaded successfully' 
                        : selfieMethod === 'camera' 
                          ? 'Please take a clear selfie with good lighting' 
                          : 'Please upload a clear photo of yourself'}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Selfie Guidelines</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Face must be clearly visible and centered</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ensure good lighting with no shadows on your face</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Remove hats, sunglasses, and face masks</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Use a plain background if possible</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.documents.selfie}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${formData.documents.selfie ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <span>Next Step</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Recheck Everything */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Information</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Full Name</p>
                        <p className="font-medium">{formData.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formData.dateOfBirth || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Residential Address</p>
                        <p className="font-medium">{formData.residentialAddress || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone Number</p>
                        <p className="font-medium">{formData.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">ID Verification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Identity Type</p>
                        <p className="font-medium">{formData.identityType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ID Number</p>
                        <p className="font-medium">{formData.nationalIdNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Issuing Country</p>
                        <p className="font-medium">{formData.issuingCountry}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-500 mb-2">Documents</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${formData.documents.idFront ? 'bg-green-100' : 'bg-white'}`}>
                            {formData.documents.idFront ? (
                              <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            )}
                          </div>
                          <span className="text-xs">ID Front</span>
                        </div>
                        
                        {formData.identityType !== 'PASSPORT' && (
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${formData.documents.idBack ? 'bg-green-100' : 'bg-white'}`}>
                              {formData.documents.idBack ? (
                                <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              )}
                            </div>
                            <span className="text-xs">ID Back</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${formData.documents.selfie ? 'bg-green-100' : 'bg-white'}`}>
                            {formData.documents.selfie ? (
                              <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            )}
                          </div>
                          <span className="text-xs">Selfie</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label className="ml-2 text-xs text-gray-600">
                      I confirm that all the information provided is accurate and I accept the <span className="text-blue-500 cursor-pointer">Terms of Service</span> and <span className="text-blue-500 cursor-pointer">Privacy Policy</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.acceptTerms}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${formData.acceptTerms ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <span>Submit Verification</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Status Tracking */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Verification Status</h2>
                
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-100">
                  {formData.verificationStatus === 'pending' ? (
                    <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : formData.verificationStatus === 'approved' ? (
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {formData.verificationStatus === 'pending' && 'Verification in Progress'}
                  {formData.verificationStatus === 'approved' && 'Verification Approved'}
                  {formData.verificationStatus === 'rejected' && 'Verification Rejected'}
                </h3>
                
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {formData.verificationStatus === 'pending' && 'We are currently reviewing your documents. This usually takes 1-2 business days.'}
                  {formData.verificationStatus === 'approved' && 'Your identity has been successfully verified. You now have full access to our services.'}
                  {formData.verificationStatus === 'rejected' && 'We could not verify your identity. Please check your documents and try again.'}
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Verification Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference ID</span>
                      <span className="font-medium">KYC-{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submission Date</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium ${
                        formData.verificationStatus === 'pending' ? 'text-yellow-600' : 
                        formData.verificationStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formData.verificationStatus.charAt(0).toUpperCase() + formData.verificationStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 
                  {formData.verificationStatus === 'approved' && (
                    <button
                    onClick={() => router.push('/signin')}
                    className="px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors">
                      Continue to Login Page 
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}