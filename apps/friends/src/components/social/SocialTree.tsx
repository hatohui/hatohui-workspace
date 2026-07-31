import { useTranslation } from '@hatohui/i18n';
import { Avatar, TooltipProvider } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';
import { useSocialGraph } from '../../hooks/useSocialGraph';
import SocialAvatarNode from './SocialAvatarNode';

function SocialTree() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading, isError } = useSocialGraph();
  const nodes = data?.data.friends ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  }

  if (isError) {
    return <p className="text-destructive">{t('common:loadError')}</p>;
  }

  if (nodes.length === 0) {
    return <p className="text-muted-foreground">{t('social.empty')}</p>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-start gap-10">
        <div className="flex flex-col items-center gap-1">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name ?? ''}
            className="h-12 w-12 ring-2 ring-primary ring-offset-2 ring-offset-background"
          />
          <span className="text-xs text-muted-foreground">
            {t('social.you')}
          </span>
        </div>

        <div className="flex flex-col gap-6 border-l border-border pl-8">
          {nodes.map(({ friend, friendsOfFriend }) => (
            <div key={friend.id} className="flex items-center gap-8">
              <SocialAvatarNode friend={friend} label={friend.name} />
              {friendsOfFriend.length > 0 && (
                <div className="flex gap-4 border-l border-border pl-8">
                  {friendsOfFriend.map((fof) => (
                    <SocialAvatarNode
                      key={fof.id}
                      friend={fof}
                      size="sm"
                      label={t('social.friendOfLabel', {
                        name: fof.name,
                        via: friend.name,
                      })}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default SocialTree;
