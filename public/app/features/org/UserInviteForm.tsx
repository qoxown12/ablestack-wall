import React, { FC } from 'react';
import {
  HorizontalGroup,
  Button,
  LinkButton,
  Input,
  Switch,
  RadioButtonGroup,
  Form,
  Field,
  InputControl,
} from '@grafana/ui';
import { getConfig } from 'app/core/config';
import { OrgRole } from 'app/types';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { appEvents } from 'app/core/core';
import { AppEvents, locationUtil } from '@grafana/data';

const roles = [
  { label: 'Viewer', value: OrgRole.Viewer },
  { label: 'Editor', value: OrgRole.Editor },
  { label: 'Admin', value: OrgRole.Admin },
];

interface FormModel {
  role: OrgRole;
  name: string;
  loginOrEmail?: string;
  sendEmail: boolean;
  email: string;
}

interface Props {}

export const UserInviteForm: FC<Props> = ({}) => {
  const onSubmit = async (formData: FormModel) => {
    try {
      await getBackendSrv().post('/api/org/invites', formData);
    } catch (err) {
      appEvents.emit(AppEvents.alertError, ['Failed to send invitation.', err.message]);
    }
    locationService.push('/org/users/');
  };

  const defaultValues: FormModel = {
    name: '',
    email: '',
    role: OrgRole.Editor,
    sendEmail: true,
  };

  return (
    <Form defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ register, control, errors }) => {
        return (
          <>
            <Field
              invalid={!!errors.loginOrEmail}
              error={!!errors.loginOrEmail ? '이메일 또는 사용자명은 필수입니다.' : undefined}
              label="이메일 또는 사용자명"
            >
              <Input {...register('loginOrEmail', { required: true })} placeholder="email@example.com" />
            </Field>
            <Field invalid={!!errors.name} label="이름">
              <Input {...register('name')} placeholder="(optional)" />
            </Field>
            <Field invalid={!!errors.role} label="권한">
              <InputControl
                render={({ field: { ref, ...field } }) => <RadioButtonGroup {...field} options={roles} />}
                control={control}
                name="role"
              />
            </Field>
            <Field label="초대 메일 발송">
              <Switch {...register('sendEmail')} />
            </Field>
            <HorizontalGroup>
              <Button type="submit">제출</Button>
              <LinkButton href={locationUtil.assureBaseUrl(getConfig().appSubUrl + '/org/users')} variant="secondary">
                돌아가기
              </LinkButton>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

export default UserInviteForm;
