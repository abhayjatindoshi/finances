import { Card, Text, tokens } from '@fluentui/react-components';
import { BuildingBankRegular, PeopleRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId } = useParams();

  const settingsBlocks = [
    {
      id: 'accounts',
      title: t('app.accounts'),
      description: t('app.manageAccounts'),
      icon: <BuildingBankRegular />,
      color: tokens.colorPaletteTealBackground2,
      path: `/tenants/${tenantId}/settings/accounts`
    },
    {
      id: 'household',
      title: t('app.household'),
      description: t('app.manageHousehold'),
      icon: <PeopleRegular />,
      color: tokens.colorPalettePurpleBackground2,
      path: `/tenants/${tenantId}/settings/household`
    }
  ];

  const handleBlockClick = (path: string) => {
    navigate(path);
  };

  function SettingsCard({ block }: { block: typeof settingsBlocks[0] }) {
    const [hover, setHover] = React.useState(false);
    
    // Create subtle gradient with transparency using CSS custom properties
    const subtleGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${block.color} 25%, transparent) 0%, 
      color-mix(in srgb, ${block.color} 15%, transparent) 50%, 
      color-mix(in srgb, ${block.color} 10%, transparent) 100%)`;

    const hoverGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${block.color} 40%, transparent) 0%, 
      color-mix(in srgb, ${block.color} 25%, transparent) 50%, 
      color-mix(in srgb, ${block.color} 20%, transparent) 100%)`;

    return (
      <div
        onClick={() => handleBlockClick(block.path)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ textDecoration: 'none', cursor: 'pointer' }}
      >
        <Card 
          style={{ 
            position: 'relative',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            minWidth: '300px',
            background: hover ? hoverGradient : subtleGradient,
            border: `1px solid color-mix(in srgb, ${block.color} 50%, transparent)`,
            transform: hover ? 'scale(1.02)' : 'scale(1)',
            boxShadow: hover 
              ? `0 8px 24px color-mix(in srgb, ${block.color} 30%, transparent), 0 4px 12px color-mix(in srgb, ${block.color} 25%, transparent), inset 0 1px 0 color-mix(in srgb, ${block.color} 40%, transparent)`
              : `0 4px 12px color-mix(in srgb, ${block.color} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${block.color} 30%, transparent)`,
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
                color-mix(in srgb, ${block.color} 30%, transparent) 0%, 
                transparent 60%)`,
              opacity: hover ? 1 : 0.8,
              transition: 'opacity 0.3s ease',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
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
                {block.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Text 
                  style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: tokens.colorNeutralForegroundOnBrand,
                    marginBottom: '8px',
                    display: 'block'
                  }}
                >
                  {block.title}
                </Text>
                <Text 
                  style={{ 
                    fontSize: '14px',
                    color: tokens.colorNeutralForegroundOnBrand,
                    opacity: 0.8,
                    lineHeight: '1.4',
                    display: 'block'
                  }}
                >
                  {block.description}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 app-content-height">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{t('app.settings')}</h1>
        <p className="text-gray-400">{t('app.settingsDescription')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsBlocks.map((block) => (
          <SettingsCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;