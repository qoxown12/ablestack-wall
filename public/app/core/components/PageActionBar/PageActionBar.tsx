import React, { PureComponent } from 'react';
import { FilterInput } from '../FilterInput/FilterInput';
import { LinkButton } from '@grafana/ui';

export interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  linkButton?: { href: string; title: string };
  target?: string;
  placeholder?: string;
}

export default class PageActionBar extends PureComponent<Props> {
  render() {
    const { searchQuery, linkButton, setSearchQuery, target, placeholder = '이름과 유형으로 검색' } = this.props;
    const linkProps = { href: linkButton?.href };

    if (target) {
      (linkProps as any).target = target;
    }

    return (
      <div className="page-action-bar">
        <div className="gf-form gf-form--grow">
          <FilterInput value={searchQuery} onChange={setSearchQuery} placeholder={placeholder} />
        </div>
        {linkButton && <LinkButton {...linkProps}>{linkButton.title}</LinkButton>}
      </div>
    );
  }
}
