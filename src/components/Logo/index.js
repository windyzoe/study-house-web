import React from 'react';
import styles from './index.less';

/**
 * @description 当前网站的logo
 * @date 2020-11-13
 * @param { hiddenTitle } 是否隐藏logo
 * @returns
 */
export default function Logo({ hiddenTitle }) {
  return <div className={styles.root}>{!hiddenTitle && <div style={{ letterSpacing: '0.15rem' }}>STUDY HOUSE</div>}</div>;
}
