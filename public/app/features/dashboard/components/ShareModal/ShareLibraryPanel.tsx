import React from 'react';
import { PanelModel } from 'app/features/dashboard/state';
import { AddLibraryPanelContents } from 'app/features/library-panels/components/AddLibraryPanelModal/AddLibraryPanelModal';

interface Props {
  onDismiss?: () => void;
  panel?: PanelModel;
  initialFolderId?: number;
}

export const ShareLibraryPanel = ({ panel, initialFolderId, onDismiss }: Props) => {
  if (!panel) {
    return null;
  }

  return (
    <>
      <p className="share-modal-info-text">라이브러리 패널을 만듭니다.</p>
      <AddLibraryPanelContents panel={panel} initialFolderId={initialFolderId} onDismiss={onDismiss!} />
    </>
  );
};
