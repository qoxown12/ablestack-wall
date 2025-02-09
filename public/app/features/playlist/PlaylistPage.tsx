import React, { FC, useState } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { NavModel, SelectableValue, urlUtil } from '@grafana/data';
import Page from 'app/core/components/Page/Page';
import { StoreState } from 'app/types';
import { GrafanaRouteComponentProps } from '../../core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { useAsync } from 'react-use';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { PlaylistDTO } from './types';
import { Button, Card, Checkbox, Field, LinkButton, Modal, RadioButtonGroup, VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import PageActionBar from 'app/core/components/PageActionBar/PageActionBar';
import EmptyListCTA from '../../core/components/EmptyListCTA/EmptyListCTA';

interface ConnectedProps {
  navModel: NavModel;
}

interface Props extends ConnectedProps, GrafanaRouteComponentProps {}

export const PlaylistPage: FC<Props> = ({ navModel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startPlaylist, setStartPlaylist] = useState<PlaylistDTO | undefined>();

  const { value: playlists, loading } = useAsync(async () => {
    return getBackendSrv().get('/api/playlists', { query: searchQuery }) as Promise<PlaylistDTO[]>;
  });
  const hasPlaylists = playlists && playlists.length > 0;

  let content = (
    <EmptyListCTA
      title="아직 생성된 재생목록이 없습니다"
      buttonIcon="plus"
      buttonLink="playlists/new"
      buttonTitle="플레이리스트 생성"
      proTip="플레이리스트를 사용하여 사용자 제어 없이 TV에서 대시보드를 순환할 수 있습니다."
      //proTipLink="http://docs.grafana.org/reference/playlist/"
      //proTipLinkTitle="Learn more"
      //proTipTarget="_blank"
    />
  );

  if (hasPlaylists) {
    content = (
      <>
        {playlists!.map((playlist) => (
          <Card heading={playlist.name} key={playlist.id.toString()}>
            <Card.Actions>
              <Button variant="secondary" icon="play" onClick={() => setStartPlaylist(playlist)}>
                플레이리스트 시작
              </Button>
              {contextSrv.isEditor && (
                <LinkButton key="edit" variant="secondary" href={`/playlists/edit/${playlist.id}`} icon="cog">
                  플레이리스트 편집
                </LinkButton>
              )}
            </Card.Actions>
          </Card>
        ))}
      </>
    );
  }

  return (
    <Page navModel={navModel}>
      <Page.Contents isLoading={loading}>
        {hasPlaylists && (
          <PageActionBar
            searchQuery={searchQuery}
            linkButton={{ title: '새 플레이리스트', href: '/playlists/new' }}
            setSearchQuery={setSearchQuery}
          />
        )}
        {content}
        {startPlaylist && <StartModal playlist={startPlaylist} onDismiss={() => setStartPlaylist(undefined)} />}
      </Page.Contents>
    </Page>
  );
};

const mapStateToProps: MapStateToProps<ConnectedProps, {}, StoreState> = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'playlists'),
});

export default connect(mapStateToProps)(PlaylistPage);

export interface StartModalProps {
  playlist: PlaylistDTO;
  onDismiss: () => void;
}

export const StartModal: FC<StartModalProps> = ({ playlist, onDismiss }) => {
  const [mode, setMode] = useState<any>(false);
  const [autoFit, setAutofit] = useState(false);

  const modes: Array<SelectableValue<any>> = [
    { label: 'Normal', value: false },
    { label: 'TV', value: 'tv' },
    { label: 'Kiosk', value: true },
  ];

  const onStart = () => {
    const params: any = {};
    if (mode) {
      params.kiosk = mode;
    }
    if (autoFit) {
      params.autofitpanels = true;
    }
    locationService.push(urlUtil.renderUrl(`/playlists/play/${playlist.id}`, params));
  };

  return (
    <Modal isOpen={true} icon="play" title="플레이리스트 시작" onDismiss={onDismiss}>
      <VerticalGroup>
        <Field label="모드">
          <RadioButtonGroup value={mode} options={modes} onChange={setMode} />
        </Field>
        <Checkbox
          label="자동 맞춤"
          description="패널 높이가 화면 크기에 맞게 조정됩니다."
          name="autofix"
          value={autoFit}
          onChange={(e) => setAutofit(e.currentTarget.checked)}
        />
      </VerticalGroup>
      <Modal.ButtonRow>
        <Button variant="primary" onClick={onStart}>
          {playlist.name} 시작
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
