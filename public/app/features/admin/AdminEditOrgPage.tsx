import React, { FC, useState, useEffect } from 'react';
import Page from 'app/core/components/Page/Page';
import { useSelector } from 'react-redux';
import { StoreState, OrgUser } from 'app/types';
import { getNavModel } from 'app/core/selectors/navModel';
import UsersTable from '../users/UsersTable';
import { useAsyncFn } from 'react-use';
import { getBackendSrv } from '@grafana/runtime';
import { UrlQueryValue } from '@grafana/data';
import { Form, Field, Input, Button, Legend } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface OrgNameDTO {
  orgName: string;
}

const getOrg = async (orgId: UrlQueryValue) => {
  return await getBackendSrv().get('/api/orgs/' + orgId);
};

const getOrgUsers = async (orgId: UrlQueryValue) => {
  return await getBackendSrv().get('/api/orgs/' + orgId + '/users');
};

const updateOrgUserRole = async (orgUser: OrgUser, orgId: UrlQueryValue) => {
  await getBackendSrv().patch('/api/orgs/' + orgId + '/users/' + orgUser.userId, orgUser);
};

const removeOrgUser = async (orgUser: OrgUser, orgId: UrlQueryValue) => {
  return await getBackendSrv().delete('/api/orgs/' + orgId + '/users/' + orgUser.userId);
};

interface Props extends GrafanaRouteComponentProps<{ id: string }> {}

export const AdminEditOrgPage: FC<Props> = ({ match }) => {
  const navIndex = useSelector((state: StoreState) => state.navIndex);
  const navModel = getNavModel(navIndex, 'global-orgs');
  const orgId = parseInt(match.params.id, 10);

  const [users, setUsers] = useState<OrgUser[]>([]);

  const [orgState, fetchOrg] = useAsyncFn(() => getOrg(orgId), []);
  const [, fetchOrgUsers] = useAsyncFn(() => getOrgUsers(orgId), []);

  useEffect(() => {
    fetchOrg();
    fetchOrgUsers().then((res) => setUsers(res));
  }, [fetchOrg, fetchOrgUsers]);

  const updateOrgName = async (name: string) => {
    return await getBackendSrv().put('/api/orgs/' + orgId, { ...orgState.value, name });
  };

  return (
    <Page navModel={navModel}>
      <Page.Contents>
        <>
          <Legend>조직 편집</Legend>

          {orgState.value && (
            <Form
              defaultValues={{ orgName: orgState.value.name }}
              onSubmit={async (values: OrgNameDTO) => await updateOrgName(values.orgName)}
            >
              {({ register, errors }) => (
                <>
                  <Field label="이름" invalid={!!errors.orgName} error="이름은 필수입니다.">
                    <Input {...register('orgName', { required: true })} />
                  </Field>
                  <Button>수정</Button>
                </>
              )}
            </Form>
          )}

          <div
            className={css`
              margin-top: 20px;
            `}
          >
            <Legend>Organization users</Legend>
            {!!users.length && (
              <UsersTable
                users={users}
                onRoleChange={(role, orgUser) => {
                  updateOrgUserRole({ ...orgUser, role }, orgId);
                  setUsers(
                    users.map((user) => {
                      if (orgUser.userId === user.userId) {
                        return { ...orgUser, role };
                      }
                      return user;
                    })
                  );
                  fetchOrgUsers();
                }}
                onRemoveUser={(orgUser) => {
                  removeOrgUser(orgUser, orgId);
                  setUsers(users.filter((user) => orgUser.userId !== user.userId));
                  fetchOrgUsers();
                }}
              />
            )}
          </div>
        </>
      </Page.Contents>
    </Page>
  );
};

export default AdminEditOrgPage;
