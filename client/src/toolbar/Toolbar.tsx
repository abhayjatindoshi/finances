import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { ArrowSwapRegular, ArrowUploadRegular, BuildingBankRegular, ChevronDownRegular, DataPieRegular, DesktopRegular, HomeRegular, SettingsRegular, SignOutRegular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { withDropdownTheme } from "../common/Dialog";
import UserProfile from "../common/UserProfile";
import { logoutUrl } from "../constants";
import syncManager from "../db/sync-manager";
import { Tenant } from "../services/entities/Tenant";
import { User } from "../services/entities/User";
import { unsubscribeAll } from "../utils/ComponentUtils";
import { subscribeTo } from "../utils/GlobalVariable";
import { tenantToFolders } from "../utils/TenantUtils";

interface ToolbarProps {
  tenants?: Tenant[];
}

export default function Toolbar({ tenants = [] }: ToolbarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [user, setUser] = useState<User | undefined>();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    const userSubscription = subscribeTo('user', (u) => setUser(u as User));
    return unsubscribeAll(screenSubscription, userSubscription);
  }, []);

  const currentTenant = tenants.find(t => t.id === tenantId);
  const folders = tenantToFolders(tenants);

  const isActive = (link: string) => {
    return location.pathname.startsWith(`/tenants/${tenantId}/${link}`);
  };

  const handleTenantSelect = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}/dashboard`);
  };

  const handleLogout = () => {
    window.location.href = logoutUrl;
  };

  const handleSync = () => {
    if (!tenantId) return;
    syncManager.sync(tenantId, { replacement: true });
  };

  const renderTenantFolders = (folders: Record<string, Tenant | Record<string, Tenant | Record<string, Tenant>>>, level = 0): React.ReactNode[] => {
    return Object.entries(folders)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .map(([key, value]: [string, Tenant | Record<string, Tenant | Record<string, Tenant>>]) => {
        if ('name' in value) {
          // This is a tenant
          return (
            <MenuItem 
              key={(value as Tenant).id}
              onClick={() => handleTenantSelect(value as Tenant)}
              className={(value as Tenant).id === tenantId ? 'bg-blue-600' : ''}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              {key}
            </MenuItem>
          );
        } else {
          // This is a folder
          return (
            <div key={key}>
              <div 
                className="px-3 py-1 text-xs font-medium text-gray-400"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                {key}
              </div>
              {renderTenantFolders(value as Record<string, Tenant | Record<string, Tenant>>, level + 1)}
            </div>
          );
        }
      });
  };

  return (
    <div 
      className="flex items-center justify-between px-6 py-2" 
      style={{ 
        backgroundColor: 'var(--colorNeutralBackground2)',
        borderBottom: '1px solid var(--colorNeutralStroke1)'
      }}
    >
      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <NavLink 
          icon={<HomeRegular />} 
          title={t('app.home')} 
          link="dashboard" 
          isActive={isActive('dashboard')}
          hideTitle={isPortrait}
        />
        <NavLink 
          icon={<ArrowSwapRegular />} 
          title={t('app.transactions')} 
          link="transactions" 
          isActive={isActive('transactions')}
          hideTitle={isPortrait}
        />
        <NavLink 
          icon={<DataPieRegular />} 
          title={t('app.budget')} 
          link="budget" 
          isActive={isActive('budget')}
          hideTitle={isPortrait}
        />
        <NavLink 
          icon={<ArrowUploadRegular />} 
          title="Import" 
          link="import" 
          isActive={isActive('import')}
          hideTitle={isPortrait}
        />
        <NavLink 
          icon={<SettingsRegular />} 
          title={t('app.settings')} 
          link="settings" 
          isActive={isActive('settings')}
          hideTitle={isPortrait}
        />
      </div>

      {/* Right Section - Tenant Switcher and Profile */}
      <div className="flex items-center gap-4">
        {/* Tenant Switcher */}
        {tenants.length > 0 && (
          withDropdownTheme(
            <Menu>
              <MenuTrigger>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-medium">
                    {currentTenant?.name || t('app.tenant')}
                  </span>
                  <ChevronDownRegular />
                </div>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {renderTenantFolders(folders)}
                  <div className="border-t border-gray-600 my-1"></div>
                  <MenuItem 
                    icon={<BuildingBankRegular />}
                    onClick={() => navigate('/tenants')}
                  >
                    {t('app.manageTenants')}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          )
        )}

        {/* Profile Menu */}
        {user && (
          withDropdownTheme(
            <Menu>
              <MenuTrigger>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-700 cursor-pointer">
                  <UserProfile 
                    name={user.name || user.email} 
                    profileImage={user.picture} 
                    size={28} 
                  />
                  {!isPortrait && (
                    <span className="text-sm font-medium">
                      {user.name || user.email}
                    </span>
                  )}
                </div>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem 
                    icon={<SettingsRegular />}
                    onClick={() => navigate(`/tenants/${tenantId}/settings`)}
                  >
                    {t('app.settings')}
                  </MenuItem>
                  <MenuItem 
                    icon={<ArrowSwapRegular />}
                    onClick={handleSync}
                  >
                    {t('app.sync')}
                  </MenuItem>
                  <MenuItem 
                    icon={<DesktopRegular />}
                    onClick={() => navigate('/')}
                  >
                    {t('app.switchToOldUI')}
                  </MenuItem>
                  <MenuItem 
                    icon={<SignOutRegular />}
                    onClick={handleLogout}
                  >
                    {t('app.logout')}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          )
        )}
      </div>
    </div>
  );
}

// Navigation Link Component
interface NavLinkProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  isActive: boolean;
  hideTitle?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, title, link, isActive, hideTitle }) => {
  const navigate = useNavigate();
  const { tenantId } = useParams();

  return (
    <div className="flex flex-col items-center relative">
      <button
        onClick={() => navigate(`/tenants/${tenantId}/${link}`)}
        className="flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200"
        style={{
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          background: isActive 
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(29, 78, 216, 0.1) 100%)'
            : 'transparent',
          border: isActive 
            ? '1px solid rgba(59, 130, 246, 0.4)' 
            : '1px solid transparent',
          boxShadow: isActive 
            ? '0 0 15px rgba(59, 130, 246, 0.3), 0 0 30px rgba(37, 99, 235, 0.2)' 
            : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <div style={{ fontSize: '1.1rem' }}>
          {icon}
        </div>
        {!hideTitle && <span className="text-sm font-medium">{title}</span>}
      </button>
    </div>
  );
};
