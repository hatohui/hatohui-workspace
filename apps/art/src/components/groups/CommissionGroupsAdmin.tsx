'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button, Card, CardContent, Input, Label } from '@hatohui/ui';
import type { CommissionGroupDto } from '@hatohui/models';
import { useCommissionGroupsAdmin } from '@/hooks/useCommissionGroupsAdmin';

function AddMemberForm({
  onAdd,
}: {
  onAdd: (email: string, name?: string) => void;
}) {
  const { t } = useTranslation('art');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <Label htmlFor="member-email">
          {t('commission.groupsAdmin.memberEmail')}
        </Label>
        <Input
          id="member-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="member-name">
          {t('commission.groupsAdmin.memberNameHint')}
        </Label>
        <Input
          id="member-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button
        size="sm"
        disabled={!email.trim()}
        onClick={() => {
          onAdd(email.trim(), name.trim() || undefined);
          setEmail('');
          setName('');
        }}
      >
        {t('commission.groupsAdmin.addMember')}
      </Button>
    </div>
  );
}

function GroupCard({
  group,
  onAddMember,
  onRemoveMember,
}: {
  group: CommissionGroupDto;
  onAddMember: (email: string, name?: string) => void;
  onRemoveMember: (clientId: string) => void;
}) {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const shareUrl = `/${user?.handle ?? ''}/groups/${group.accessCode}`;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="font-medium">{group.title}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>

        <div className="rounded-md bg-secondary px-3 py-2 text-sm">
          <p className="text-xs text-muted-foreground">
            {t('commission.groupsAdmin.shareWarning')}
          </p>
          <code className="break-all">{shareUrl}</code>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">
            {t('commission.groups.members')}
          </p>
          {group.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('commission.groupsAdmin.noMembers')}
            </p>
          ) : (
            <ul className="space-y-1">
              {group.members.map((member) => (
                <li
                  key={member.clientId}
                  className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
                >
                  <span>
                    {member.name} · {member.email}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveMember(member.clientId)}
                  >
                    {t('gallery.card.delete')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AddMemberForm onAdd={onAddMember} />
      </CardContent>
    </Card>
  );
}

export function CommissionGroupsAdmin() {
  const { t } = useTranslation('art');
  const { items, isLoading, create, addMember, removeMember } =
    useCommissionGroupsAdmin();
  const [title, setTitle] = useState('');

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">
        {t('commission.groupsAdmin.title')}
      </h1>

      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('commission.groupsAdmin.newTitle')}
        />
        <Button
          disabled={!title.trim()}
          onClick={() => {
            void create(title.trim());
            setTitle('');
          }}
        >
          {t('commission.groupsAdmin.create')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">
          {t('commission.groupsAdmin.empty')}
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onAddMember={(email, name) =>
                void addMember(group.id, email, name)
              }
              onRemoveMember={(clientId) =>
                void removeMember(group.id, clientId)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
