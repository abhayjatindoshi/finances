import { Card, Text, tokens } from '@fluentui/react-components';
import { BuildingBankRegular, MoneyRegular, PeopleRegular, TagRegular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId } = useParams();

  const householdSettings = [
    {
      id: 'household',
      title: t('app.household'),
      icon: <PeopleRegular />,
      color: tokens.colorPalettePurpleBackground2,
      path: `/tenants/${tenantId}/settings/household`
    }
  ];

  const dataSettings = [
    {
      id: 'accounts',
      title: 'Accounts',
      icon: <BuildingBankRegular />,
      color: tokens.colorPaletteTealBackground2,
      path: `/tenants/${tenantId}/settings/data/accounts`
    },
    {
      id: 'budget',
      title: 'Budget',
      icon: <MoneyRegular />,
      color: tokens.colorPaletteGreenBackground2,
      path: `/tenants/${tenantId}/settings/data/budget`
    },
    {
      id: 'classification',
      title: 'Classification',
      icon: <TagRegular />,
      color: tokens.colorPaletteDarkOrangeBackground2,
      path: `/tenants/${tenantId}/settings/data/classification`
    }
  ];

  const handleBlockClick = (path: string) => {
    navigate(path);
  };

  function SettingsCard({ block }: { block: typeof householdSettings[0] | typeof dataSettings[0] }) {
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
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            aspectRatio: '1',
            minHeight: '90px',
            background: hover ? hoverGradient : subtleGradient,
            border: `1px solid color-mix(in srgb, ${block.color} 50%, transparent)`,
            transform: hover ? 'scale(1.03)' : 'scale(1)',
            boxShadow: hover 
              ? `0 6px 18px color-mix(in srgb, ${block.color} 25%, transparent), 0 3px 8px color-mix(in srgb, ${block.color} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${block.color} 35%, transparent)`
              : `0 3px 8px color-mix(in srgb, ${block.color} 15%, transparent), inset 0 1px 0 color-mix(in srgb, ${block.color} 25%, transparent)`,
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '8px',
              background: `radial-gradient(circle at ${hover ? '80% 20%' : '20% 80%'}, 
                color-mix(in srgb, ${block.color} 30%, transparent) 0%, 
                transparent 60%)`,
              opacity: hover ? 1 : 0.8,
              transition: 'opacity 0.3s ease',
            }}
          />
          <div style={{ 
            position: 'relative', 
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <div 
              style={{ 
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colorNeutralForegroundOnBrand
              }}
            >
              {block.icon}
            </div>
            <Text 
              style={{ 
                fontSize: '16px',
                fontWeight: '600',
                color: tokens.colorNeutralForegroundOnBrand,
                textAlign: 'center',
                lineHeight: '1.2'
              }}
            >
              {block.title}
            </Text>
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
      
      {/* Household Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Household</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {householdSettings.map((block) => (
            <SettingsCard key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Data</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {dataSettings.map((block) => (
            <SettingsCard key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;