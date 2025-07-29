import {
    Spinner,
    Text,
    tokens
} from '@fluentui/react-components';
import {
    BuildingBankRegular
} from '@fluentui/react-icons';
import React from 'react';
import Account from '../../../db/models/Account';

interface ProcessingStepProps {
  selectedAccount: Account | null;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ selectedAccount }) => {
  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: 'var(--colorNeutralBackground1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px'
      }}>
        <Spinner size="large" />
        <Text style={{ 
          fontSize: '20px',
          fontWeight: '600',
          color: tokens.colorNeutralForeground1
        }}>
          Processing Import...
        </Text>
      </div>
      
      {selectedAccount && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}>
          <BuildingBankRegular style={{ color: tokens.colorNeutralForeground1 }} />
          <Text style={{ color: tokens.colorNeutralForeground1 }}>
            Importing to {selectedAccount.name}
          </Text>
        </div>
      )}
      
      <Text style={{ 
        fontSize: '14px',
        color: tokens.colorNeutralForeground1,
        opacity: 0.7,
        textAlign: 'center'
      }}>
        Please wait while we process your file and import the transactions...
      </Text>
    </div>
  );
};

export default ProcessingStep; 