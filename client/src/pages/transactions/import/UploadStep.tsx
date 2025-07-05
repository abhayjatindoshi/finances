import {
    Button,
    Spinner,
    Text,
    tokens
} from '@fluentui/react-components';
import {
    ArrowUploadRegular,
    DocumentRegular,
    MailRegular
} from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';

interface UploadStepProps {
  onFileUploaded: (files: File[]) => void;
  isUploading: boolean;
}

const UploadStep: React.FC<UploadStepProps> = ({ onFileUploaded, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles([file]);
      onFileUploaded([file]);
    }
  }, [onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFiles([file]);
      onFileUploaded([file]);
    }
  }, [onFileUploaded]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Upload Block Component
  const UploadBlock = () => {
    const [hover, setHover] = useState(false);
    
    const uploadColor = tokens.colorPaletteRedBackground2;
    const subtleGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${uploadColor} 25%, transparent) 0%, 
      color-mix(in srgb, ${uploadColor} 15%, transparent) 50%, 
      color-mix(in srgb, ${uploadColor} 10%, transparent) 100%)`;

    const hoverGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${uploadColor} 40%, transparent) 0%, 
      color-mix(in srgb, ${uploadColor} 25%, transparent) 50%, 
      color-mix(in srgb, ${uploadColor} 20%, transparent) 100%)`;

    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          position: 'relative',
          borderRadius: '12px',
          padding: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          background: hover ? hoverGradient : subtleGradient,
          border: `2px dashed color-mix(in srgb, ${uploadColor} 50%, transparent)`,
          transform: hover ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hover 
            ? `0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)`
            : `0 4px 12px rgba(0, 0, 0, 0.05)`,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '12px',
            background: `radial-gradient(circle at ${hover ? '80% 20%' : '20% 80%'}, 
              color-mix(in srgb, ${uploadColor} 30%, transparent) 0%, 
              transparent 60%)`,
            opacity: hover ? 1 : 0.8,
            transition: 'opacity 0.3s ease',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div 
              style={{ 
                fontSize: '2rem',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colorNeutralForeground1
              }}
            >
              <ArrowUploadRegular />
            </div>
            <div style={{ flex: 1 }}>
              <Text 
                style={{ 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: tokens.colorNeutralForeground1,
                  marginBottom: '8px',
                  display: 'block'
                }}
              >
                Upload File
              </Text>
              <Text 
                style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.8,
                  lineHeight: '1.4',
                  display: 'block'
                }}
              >
                {isDragOver ? 'Drop file here' : 'Drop file here or click to browse'}
              </Text>
            </div>
          </div>

          {isUploading && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              gap: '12px'
            }}>
              <Spinner size="medium" />
              <Text size={300} style={{ color: tokens.colorNeutralForeground1 }}>
                Uploading files...
              </Text>
            </div>
          )}

          {uploadedFiles.length > 0 && !isUploading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                Selected Files ({uploadedFiles.length})
              </Text>
              <div style={{ flex: 1, overflow: 'auto' }}>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: tokens.colorNeutralForeground1 }}>
                        <DocumentRegular />
                      </div>
                      <div>
                        <Text size={300} style={{ 
                          color: tokens.colorNeutralForeground1,
                          display: 'block'
                        }}>
                          {file.name}
                        </Text>
                        <Text size={100} style={{ 
                          color: tokens.colorNeutralForeground1,
                          opacity: 0.7,
                          display: 'block'
                        }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </Text>
                      </div>
                    </div>
                    <Button
                      size="small"
                      appearance="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Email Sync Block Component
  const EmailSyncBlock = () => {
    const [hover, setHover] = useState(false);
    
    const emailColor = tokens.colorNeutralBackground2;
    const subtleGradient = `linear-gradient(135deg, 
      ${emailColor} 0%, 
      ${emailColor} 50%, 
      ${emailColor} 100%)`;

    const hoverGradient = `linear-gradient(135deg, 
      ${emailColor} 0%, 
      ${emailColor} 50%, 
      ${emailColor} 100%)`;

    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ 
          position: 'relative',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          background: hover ? hoverGradient : subtleGradient,
          border: `1px solid ${tokens.colorNeutralStroke1}`,
          transform: hover ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hover 
            ? `0 8px 24px color-mix(in srgb, ${emailColor} 30%, transparent), 0 4px 12px color-mix(in srgb, ${emailColor} 25%, transparent), inset 0 1px 0 color-mix(in srgb, ${emailColor} 40%, transparent)`
            : `0 4px 12px color-mix(in srgb, ${emailColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${emailColor} 30%, transparent)`,
          display: 'flex',
          flexDirection: 'column',
          opacity: 0.6,
          cursor: 'not-allowed'
        }}
      >
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '12px',
            background: `radial-gradient(circle at ${hover ? '80% 20%' : '20% 80%'}, 
              rgba(255, 255, 255, 0.1) 0%, 
              transparent 60%)`,
            opacity: hover ? 1 : 0.8,
            transition: 'opacity 0.3s ease',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div 
              style={{ 
                fontSize: '2rem',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colorNeutralForegroundOnBrand
              }}
            >
              <MailRegular />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Text 
                  style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: tokens.colorNeutralForegroundOnBrand,
                    display: 'block'
                  }}
                >
                  Sync from Email
                </Text>
                <div style={{
                  backgroundColor: `color-mix(in srgb, ${emailColor} 15%, transparent)`,
                  borderRadius: '4px',
                  padding: '4px 8px',
                  border: `1px solid color-mix(in srgb, ${emailColor} 30%, transparent)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: tokens.colorNeutralForegroundOnBrand,
                    opacity: 0.7
                  }}>
                    ⏳
                  </div>
                  <Text size={100} style={{ 
                    color: tokens.colorNeutralForegroundOnBrand,
                    fontWeight: '600'
                  }}>
                    Coming Soon
                  </Text>
                </div>
              </div>
              <Text 
                style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForegroundOnBrand,
                  opacity: 0.8,
                  lineHeight: '1.4',
                  display: 'block'
                }}
              >
                Automatically import transactions from your email
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: 'var(--colorNeutralBackground1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '24px',
        alignItems: 'center',
        maxWidth: '1000px',
        width: '100%'
      }}>
        <div style={{ flex: 1 }}>
          <UploadBlock />
        </div>
        <div style={{ flex: 1 }}>
          <EmailSyncBlock />
        </div>
      </div>
    </div>
  );
};

export default UploadStep; 