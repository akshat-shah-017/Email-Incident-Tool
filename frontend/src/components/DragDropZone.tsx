import { useCallback, useState, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { uploadEmail } from '../utils/api';

export default function DragDropZone() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const uploadMutation = useMutation({
        mutationFn: uploadEmail,
        onSuccess: (incident) => {
            toast.success(`Incident #${incident.id} created successfully!`);
            setUploadedFile(null);
            queryClient.invalidateQueries({ queryKey: ['incidents'] });

            // Redirect to incident detail page after a short delay
            setTimeout(() => {
                navigate(`/incidents/${incident.id}`);
            }, 1000);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to upload email');
        },
    });

    const handleFile = useCallback((file: File) => {
        // Validate file type
        const validExtensions = ['.msg', '.eml'];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            toast.error('Please upload a .msg or .eml file');
            return;
        }

        setUploadedFile(file);
        uploadMutation.mutate(file);
    }, [uploadMutation]);

    // Handle drag events
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        // Check if files were dropped
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        } else {
            // Handle potential HTML/text drop from Outlook
            const htmlData = e.dataTransfer.getData('text/html');
            const textData = e.dataTransfer.getData('text/plain');

            if (htmlData || textData) {
                toast.error('Please save the email as a .msg or .eml file first, then drag the file here');
            }
        }
    };

    // Handle file input change
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        uploadMutation.reset();
    };

    return (
        <div className="card">
            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploadMutation.isPending && document.getElementById('file-input')?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-surface-500 bg-surface-800/50' : 'border-surface-700 hover:border-surface-600 hover:bg-surface-800/30'}
                    ${uploadMutation.isPending ? 'border-surface-600 bg-surface-800/20 cursor-not-allowed' : ''}
                `}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".msg,.eml"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={uploadMutation.isPending}
                />

                <div className="flex flex-col items-center gap-4">
                    {uploadMutation.isPending ? (
                        <>
                            <div className="p-4 rounded-full bg-surface-700/50 animate-pulse">
                                <Loader2 className="w-8 h-8 text-surface-400 animate-spin" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-surface-200">Processing email...</p>
                                <p className="text-sm text-surface-500 mt-1">
                                    Parsing content and generating AI summary
                                </p>
                            </div>
                        </>
                    ) : uploadMutation.isSuccess ? (
                        <>
                            <div className="p-4 rounded-full bg-green-500/20">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-surface-200">Upload Complete!</p>
                                <p className="text-sm text-surface-500 mt-1">
                                    Redirecting to incident details...
                                </p>
                            </div>
                        </>
                    ) : uploadMutation.isError ? (
                        <>
                            <div className="p-4 rounded-full bg-red-500/20">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-surface-200">Upload Failed</p>
                                <p className="text-sm text-red-400 mt-1">
                                    {uploadMutation.error?.message || 'Please try again'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`
                                p-4 rounded-full transition-colors
                                ${isDragging ? 'bg-surface-700' : 'bg-surface-800'}
                            `}>
                                <Upload className={`
                                    w-8 h-8 transition-colors
                                    ${isDragging ? 'text-surface-300' : 'text-surface-400'}
                                `} />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-surface-200">
                                    {isDragging ? 'Drop your email file here' : 'Drag & drop an email file'}
                                </p>
                                <p className="text-sm text-surface-500 mt-1">
                                    or <span className="text-surface-300 font-medium">click to browse</span>
                                </p>
                            </div>
                            <p className="text-xs text-surface-600">
                                Supported formats: .msg, .eml
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Uploaded file info */}
            {uploadedFile && (
                <div className="mt-4 flex items-center justify-between p-3 bg-surface-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-surface-400" />
                        <div>
                            <p className="text-sm font-medium text-surface-200">{uploadedFile.name}</p>
                            <p className="text-xs text-surface-500">
                                {(uploadedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    {!uploadMutation.isPending && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
