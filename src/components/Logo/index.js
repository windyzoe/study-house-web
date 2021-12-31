import React from 'react';
import styles from './index.less';
import IconPro from '../IconPro';

/**
 * @description 当前网站的logo
 * @date 2020-11-13
 * @param { hiddenTitle } 是否隐藏logo
 * @returns
 */
export default function Logo({ hiddenTitle }) {
  return (
    <div className={styles.root}>
      <IconPro type="icon-xuexiao" />
      {!hiddenTitle && <div style={{ marginLeft: 12 }}>STUDY HOUSE</div>}
    </div>
  );
}
