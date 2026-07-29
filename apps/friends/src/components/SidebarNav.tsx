import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  UserPlus,
} from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Avatar,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hatohui/ui';
import { useAuth, useGoogleIdentity } from '@hatohui/libs';
import routes from '../constants/routes';
import useSidebarExpanded from '../hooks/useSidebarExpanded';
import SettingsDialog from './settings/SettingsDialog';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  expanded: boolean;
}

function NavItem({ to, label, icon, active, expanded }: NavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant={active ? 'default' : 'ghost'}
          size={expanded ? 'sm' : 'icon'}
          className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
          aria-label={label}
        >
          <Link to={to}>
            {icon}
            {expanded && <span className="text-sm">{label}</span>}
          </Link>
        </Button>
      </TooltipTrigger>
      {!expanded && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function SidebarNav() {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth();
  const { isReady, promptLogin } = useGoogleIdentity();
  const location = useLocation();
  const { expanded, toggle } = useSidebarExpanded();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <TooltipProvider delayDuration={300}>
      <>
        <nav
          className={`fixed inset-y-4 left-4 z-40 hidden flex-col justify-between rounded-3xl border border-border bg-card py-3 shadow-[0_1px_3px_rgba(20,20,19,0.08)] transition-[width] duration-200 sm:flex ${expanded ? 'w-44 px-2' : 'w-14 items-center px-1'}`}
        >
          {/* Top: nav links */}
          <div className={`flex flex-col gap-1 ${expanded ? '' : 'items-center'}`}>
            <NavItem
              to={routes.dashboard}
              label={t('navigation.dashboard')}
              icon={<Cake className="size-4 shrink-0" />}
              active={isActive(routes.dashboard)}
              expanded={expanded}
            />
            {user && (
              <NavItem
                to={routes.newFriend}
                label={t('navigation.addFriend')}
                icon={<UserPlus className="size-4 shrink-0" />}
                active={isActive(routes.newFriend)}
                expanded={expanded}
              />
            )}
          </div>

          {/* Bottom: settings, auth, toggle */}
          <div className={`flex flex-col gap-1 ${expanded ? '' : 'items-center'}`}>
            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size={expanded ? 'sm' : 'icon'}
                  className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
                  aria-label={t('navigation.settings')}
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="size-4 shrink-0" />
                  {expanded && (
                    <span className="text-sm">{t('navigation.settings')}</span>
                  )}
                </Button>
              </TooltipTrigger>
              {!expanded && (
                <TooltipContent side="right">
                  <p>{t('navigation.settings')}</p>
                </TooltipContent>
              )}
            </Tooltip>

            {/* Auth */}
            {!isLoading &&
              (user ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex h-9 items-center gap-2 rounded-full px-2 ${expanded ? 'rounded-lg' : 'justify-center'}`}
                      >
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.name}
                          className="size-6 shrink-0"
                        />
                        {expanded && (
                          <span className="truncate text-xs text-muted-foreground">
                            {user.name}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    {!expanded && (
                      <TooltipContent side="right">
                        <p>{user.name}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size={expanded ? 'sm' : 'icon'}
                        className={`rounded-full text-muted-foreground ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
                        aria-label={t('navigation.logout')}
                        onClick={() => void logout()}
                      >
                        <LogOut className="size-4 shrink-0" />
                        {expanded && (
                          <span className="text-sm">
                            {t('navigation.logout')}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {!expanded && (
                      <TooltipContent side="right">
                        <p>{t('navigation.logout')}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size={expanded ? 'sm' : 'icon'}
                      className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
                      disabled={!isReady}
                      aria-label={t('common:auth.login')}
                      onClick={promptLogin}
                    >
                      <GoogleIcon />
                      {expanded && (
                        <span className="text-sm">
                          {t('common:auth.login')}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">
                      <p>{t('common:auth.login')}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}

            {/* Expand / collapse toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size={expanded ? 'sm' : 'icon'}
                  className={`rounded-full text-muted-foreground ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
                  aria-label={
                    expanded
                      ? t('navigation.collapseNav')
                      : t('navigation.expandNav')
                  }
                  onClick={toggle}
                >
                  {expanded ? (
                    <ChevronLeft className="size-4 shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0" />
                  )}
                  {expanded && (
                    <span className="text-sm">
                      {t('navigation.collapseNav')}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {!expanded && (
                <TooltipContent side="right">
                  <p>{t('navigation.expandNav')}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </nav>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    </TooltipProvider>
  );
}

export default SidebarNav;
