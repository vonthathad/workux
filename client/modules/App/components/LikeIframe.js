import React, { Component } from 'react';
import { FormattedHTMLMessage } from 'react-intl';

export class LikeIframe extends Component {

  componentDidMount() {
    // document.getElementById('fb-comments')
  }
  render() {
    return (
      <FormattedHTMLMessage id="likePage" />
    );
  }
}

// Actions required to provide data for this component to render in sever side.

// Retrieve data from store as props
export default LikeIframe;
