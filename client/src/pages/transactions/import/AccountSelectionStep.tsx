import {
  Button,
  Text,
  tokens
} from '@fluentui/react-components';
import {
  ArrowRightRegular,
  ChevronRightRegular,
  DocumentRegular
} from '@fluentui/react-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import Account from '../../../db/models/Account';
import importService, { CompatibleBank } from '../../../services/import/import-service';
import { pickRandomByHash } from '../../../utils/Common';
import { AccountBalance, getBalanceMap } from '../../../utils/DbUtils';

// FluentUI theme color values for account cards
const accountCardColors = [
  tokens.colorBrandBackground,
  tokens.colorPalettePurpleBackground2,
  tokens.colorPaletteTealBackground2,
  tokens.colorPaletteGreenBackground2,
  tokens.colorPaletteCranberryBackground2,
  tokens.colorPalettePinkBackground2,
  tokens.colorPaletteRedBackground2,
  tokens.colorPaletteDarkOrangeBackground2,
  tokens.colorPaletteYellowBackground2,
  tokens.colorPaletteDarkRedBackground2,
  tokens.colorPaletteCornflowerBackground2,
  tokens.colorPaletteGoldBackground2,
  tokens.colorPaletteSeafoamBackground2,
];

interface AccountSelectionStepProps {
  accounts: Array<Account>;
  uploadedFiles: File[];
  selectedAccount: Account | null;
  onAccountSelect: (account: Account) => void;
  onBack: () => void;
  onContinue: () => void;
}

const AccountSelectionStep: React.FC<AccountSelectionStepProps> = ({
  accounts,
  uploadedFiles,
  selectedAccount,
  onAccountSelect,
  onBack,
  onContinue
}) => {
  const { tenantId } = useParams();
  const [compatibleBanks, setCompatibleBanks] = useState<CompatibleBank[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBank, setDetectedBank] = useState<CompatibleBank | null>(null);
  const [balanceMap, setBalanceMap] = useState<Map<Account, AccountBalance>>(new Map());

  const detectFileType = useCallback(async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsDetecting(true);
    try {
      const compatibleBanks = await importService.findCompatibleBanks(uploadedFiles[0]);
      setCompatibleBanks(compatibleBanks);
      
      if (compatibleBanks.length === 1) {
        setDetectedBank(compatibleBanks[0]);
      }
    } catch (error) {
      console.error('Error detecting file type:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [uploadedFiles]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      detectFileType();
    }
  }, [uploadedFiles, detectFileType]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tenantId || !accounts.length) return;
      
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts, tenantId]);

  const getFileType = (file: File): string => {
    if (file.type === 'application/pdf') {
      return 'PDF';
    } else if (file.type.indexOf('sheet') !== -1 || file.type.indexOf('excel') !== -1) {
      return 'Excel';
    } else if (file.type === 'text/csv') {
      return 'CSV';
    } else {
      return 'Unknown';
    }
  };

  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateFileName = (fileName: string, maxLength = 30): string => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    
    if (!extension || nameWithoutExtension.length <= 3) {
      return fileName.substring(0, maxLength - 3) + '...';
    }
    
    const maxNameLength = maxLength - extension.length - 4; // 4 for "..." and "."
    if (maxNameLength <= 0) {
      return '...' + extension;
    }
    
    return nameWithoutExtension.substring(0, maxNameLength) + '...' + extension;
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: 'var(--colorNeutralBackground1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '16px'
      }}>
        <Button 
          appearance="subtle" 
          icon={<ChevronRightRegular />}
          onClick={onBack}
          style={{ transform: 'rotate(180deg)' }}
        />
        <Text style={{ 
          fontSize: '24px',
          fontWeight: '600',
          color: tokens.colorNeutralForeground1
        }}>
          Select Account for Import
        </Text>
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ 
          width: '100%',
          maxWidth: '800px',
          marginBottom: '24px'
        }}>
          {/* File Details Card */}
          <div style={{ 
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <DocumentRegular style={{ 
                fontSize: '24px',
                color: tokens.colorNeutralForeground1 
              }} />
              <Text style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: tokens.colorNeutralForeground1
              }}>
                File Details
              </Text>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <Text style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.7,
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  File Name
                </Text>
                <div style={{
                  position: 'relative',
                  maxWidth: '100%'
                }}>
                  <Text style={{ 
                    fontSize: '16px',
                    fontWeight: '500',
                    color: tokens.colorNeutralForeground1,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}
                  title={uploadedFiles[0].name}
                  >
                    {truncateFileName(uploadedFiles[0].name)}
                  </Text>
                </div>
              </div>

              <div>
                <Text style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.7,
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  File Size
                </Text>
                <Text style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  color: tokens.colorNeutralForeground1,
                  display: 'block'
                }}>
                  {getFileSize(uploadedFiles[0].size)}
                </Text>
              </div>

              <div>
                <Text style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.7,
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  File Type
                </Text>
                <Text style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  color: tokens.colorNeutralForeground1,
                  display: 'block'
                }}>
                  {getFileType(uploadedFiles[0])}
                </Text>
              </div>

              <div>
                <Text style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.7,
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Detected Bank
                </Text>
                <Text style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  color: tokens.colorNeutralForeground1,
                  display: 'block'
                }}>
                  {isDetecting ? (
                    <span style={{ opacity: 0.7 }}>Detecting...</span>
                  ) : detectedBank ? (
                    detectedBank.name
                  ) : compatibleBanks.length > 0 ? (
                    `${compatibleBanks.length} compatible banks found`
                  ) : (
                    <span style={{ color: tokens.colorPaletteRedForeground1 }}>
                      No compatible bank detected
                    </span>
                  )}
                </Text>
              </div>
            </div>

            {compatibleBanks.length > 1 && (
              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Text style={{ 
                  fontSize: '14px',
                  color: tokens.colorNeutralForeground1,
                  opacity: 0.8,
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Multiple banks detected. Please select one:
                </Text>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {compatibleBanks.map((bank, index) => (
                    <Button
                      key={bank.name}
                      size="small"
                      appearance={detectedBank?.name === bank.name ? "primary" : "subtle"}
                      onClick={() => setDetectedBank(bank)}
                    >
                      {bank.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {accounts.map(account => {
          const backgroundColor = pickRandomByHash(account.name, accountCardColors);
          const subtleGradient = `linear-gradient(135deg, 
            color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
            color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
            color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

          const isSelected = selectedAccount?.id === account.id;

          return (
            <div
              key={account.id}
              onClick={() => onAccountSelect(account)}
              style={{ 
                position: 'relative',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                background: isSelected ? `linear-gradient(135deg, 
                  color-mix(in srgb, ${backgroundColor} 40%, transparent) 0%, 
                  color-mix(in srgb, ${backgroundColor} 25%, transparent) 50%, 
                  color-mix(in srgb, ${backgroundColor} 20%, transparent) 100%)` : subtleGradient,
                border: `2px solid ${isSelected ? backgroundColor : `color-mix(in srgb, ${backgroundColor} 50%, transparent)`}`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected 
                  ? `0 8px 24px color-mix(in srgb, ${backgroundColor} 30%, transparent), 0 4px 12px color-mix(in srgb, ${backgroundColor} 25%, transparent)`
                  : `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent)`,
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
                  background: `radial-gradient(circle at ${isSelected ? '80% 20%' : '20% 80%'}, 
                    color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                    transparent 60%)`,
                  opacity: isSelected ? 1 : 0.8,
                  transition: 'opacity 0.3s ease',
                }}
              />
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CustomAvatar 
                  size={48} 
                  char={account.name.charAt(0)} 
                  shape="square"
                  color={backgroundColor}
                />
                <div style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: tokens.colorNeutralForegroundOnBrand,
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {account.name}
                  </Text>
                  <Text style={{ 
                    fontSize: '14px',
                    color: tokens.colorNeutralForegroundOnBrand,
                    opacity: 0.8,
                    display: 'block'
                  }}>
                    Current Balance: ₹{balanceMap.get(account)?.balance.toFixed(2) || account.initialBalance.toFixed(2)}
                  </Text>
                </div>
                {isSelected && (
                  <div style={{ 
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: tokens.colorNeutralForegroundOnBrand,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: backgroundColor
                  }}>
                    ✓
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAccount && (
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          marginTop: '16px'
        }}>
          <Button
            appearance="subtle"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            appearance="primary"
            onClick={onContinue}
            icon={<ArrowRightRegular />}
            disabled={!detectedBank}
          >
            Process Import
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountSelectionStep; 