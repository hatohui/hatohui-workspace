'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label, Textarea } from '@hatohui/ui';
import { useCommissionGroup } from '@/hooks/useCommissionGroup';
import { useGroupMemberCode } from '@/hooks/useGroupMemberCode';

export function GroupView({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const { group, isLoading, postComment, isPosting } = useCommissionGroup(code);
  const { memberCode, setMemberCode } = useGroupMemberCode(code);
  const [codeInput, setCodeInput] = useState('');
  const [body, setBody] = useState('');

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (!group)
    return (
      <p className="text-muted-foreground">{t('common:errors.notFound')}</p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{group.title}</h1>
        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}
        {group.quote != null && (
          <p className="mt-2 text-sm">
            {t('commission.groups.sharedQuote')}: $
            {(group.quote / 100).toFixed(2)} {group.currency}
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">{t('commission.groups.members')}</h2>
        <ul className="space-y-1">
          {group.commissions.map((commission) => (
            <li
              key={commission.id}
              className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
            >
              <span>{commission.clientName}</span>
              <span className="text-muted-foreground">
                {t(`commission.status.${commission.status}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-medium">{t('commission.groups.thread')}</h2>
        <div className="space-y-2">
          {group.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('commission.groups.noComments')}
            </p>
          ) : (
            group.comments.map((comment) => (
              <p key={comment.id} className="rounded-md bg-card p-3 text-sm">
                {comment.body}
              </p>
            ))
          )}
        </div>

        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {!memberCode && (
            <div>
              <Label htmlFor="member-code">
                {t('commission.groups.memberCodeLabel')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="member-code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  placeholder={t('commission.groups.memberCodePlaceholder')}
                />
                <Button
                  disabled={!codeInput.trim()}
                  onClick={() => setMemberCode(codeInput.trim())}
                >
                  {t('commission.groups.memberCodeSave')}
                </Button>
              </div>
            </div>
          )}
          {memberCode && (
            <>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={t('commission.admin.detail.notePlaceholder')}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!body.trim() || isPosting}
                  onClick={() => {
                    void postComment(memberCode, body.trim())
                      .then(() => setBody(''))
                      .catch(() => setMemberCode(''));
                  }}
                >
                  {t('commission.admin.detail.addNote')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMemberCode('')}
                >
                  {t('commission.groups.memberCodeChange')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
