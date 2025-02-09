import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { css } from '@emotion/css';
import { CardContainer, LinkButton, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { AccessControlAction, StoreState } from 'app/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { getServerStats, ServerStat } from './state/apis';
import { contextSrv } from '../../core/services/context_srv';
import { Loader } from '../plugins/admin/components/Loader';

export interface Props {
  getServerStats: () => Promise<ServerStat | null>;
}

export const ServerStats = ({ getServerStats }: Props) => {
  const [stats, setStats] = useState<ServerStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const styles = useStyles2(getStyles);

  useEffect(() => {
    getServerStats().then((stats) => {
      setStats(stats);
      setIsLoading(false);
    });
  }, [getServerStats]);

  if (!contextSrv.hasPermission(AccessControlAction.ActionServerStatsRead)) {
    return null;
  }

  return (
    <>
      <h2 className={styles.title}>Instance statistics</h2>
      {isLoading ? (
        <div className={styles.loader}>
          <Loader text={'Loading instance stats...'} />
        </div>
      ) : stats ? (
        <div className={styles.row}>
          <StatCard
            content={[
              { name: 'Dashboards (starred)', value: `${stats.dashboards} (${stats.stars})` },
              { name: 'Tags', value: stats.tags },
              { name: 'Playlists', value: stats.playlists },
              { name: 'Snapshots', value: stats.snapshots },
            ]}
            footer={
              <LinkButton href={'/dashboards'} variant={'secondary'}>
                Manage dashboards
              </LinkButton>
            }
          />

          <div className={styles.doubleRow}>
            <StatCard
              content={[{ name: 'Data sources', value: stats.datasources }]}
              footer={
                <LinkButton href={'/datasources'} variant={'secondary'}>
                  Manage data sources
                </LinkButton>
              }
            />
            <StatCard
              content={[{ name: 'Alerts', value: stats.alerts }]}
              footer={
                <LinkButton href={'/alerting/list'} variant={'secondary'}>
                  Alerts
                </LinkButton>
              }
            />
          </div>
          <StatCard
            content={[
              { name: 'Organisations', value: stats.orgs },
              { name: 'Users total', value: stats.users },
              { name: 'Active users in last 30 days', value: stats.activeUsers },
              { name: 'Active sessions', value: stats.activeSessions },
            ]}
            footer={
              <LinkButton href={'/admin/users'} variant={'secondary'}>
                Manage users
              </LinkButton>
            }
          />
        </div>
      ) : (
        <p className={styles.notFound}>No stats found.</p>
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    title: css`
      margin-bottom: ${theme.spacing(4)};
    `,
    row: css`
      display: flex;
      justify-content: space-between;
      width: 100%;

      & > div:not(:last-of-type) {
        margin-right: ${theme.spacing(2)};
      }

      & > div {
        width: 33.3%;
      }
    `,
    doubleRow: css`
      display: flex;
      flex-direction: column;

      & > div:first-of-type {
        margin-bottom: ${theme.spacing(2)};
      }
    `,

    loader: css`
      height: 290px;
    `,

    notFound: css`
      font-size: ${theme.typography.h6.fontSize};
      text-align: center;
      height: 290px;
    `,
  };
};

const mapStateToProps = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'server-stats'),
  getServerStats,
});

type StatCardProps = {
  content: Array<Record<string, number | string>>;
  footer?: JSX.Element;
};

const StatCard = ({ content, footer }: StatCardProps) => {
  const styles = useStyles2(getCardStyles);
  return (
    <CardContainer className={styles.container} disableHover>
      <div className={styles.inner}>
        <div className={styles.content}>
          {content.map((item) => {
            return (
              <div key={item.name} className={styles.row}>
                <span>{item.name}</span>
                <span>{item.value}</span>
              </div>
            );
          })}
        </div>
        {footer && <div>{footer}</div>}
      </div>
    </CardContainer>
  );
};

const getCardStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      padding: ${theme.spacing(2)};
    `,
    inner: css`
      display: flex;
      flex-direction: column;
      width: 100%;
    `,
    content: css`
      flex: 1 0 auto;
    `,
    row: css`
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: ${theme.spacing(2)};
      align-items: center;
    `,
  };
};
export default hot(module)(connect(mapStateToProps)(ServerStats));
