import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { Paneset } from '@folio/stripes/components';

class InternetBorrow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { okapi } = this.props.stripes
    const { token } = okapi

    const site = 'https://yuyue.library.sh.cn:8443/'
    const src = `${site}?from=folio&token=${token}`
    
    return (
      <Paneset>
        <iframe
          id="internet-borrow-frame"
          title="iframe"
          src={src}
          style={{ border: 0 }}
          width="100%"
          height="100%"
          importance="high"
        />
      </Paneset>
    )
  }
}

export default InternetBorrow;
