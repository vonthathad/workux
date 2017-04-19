import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';

export class CommentIframe extends Component {

  componentDidMount() {
    // document.getElementById('fb-comments')
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }
  render() {
    return (
      <div className="fb-comments" id="fb-comments" width="100%" data-href={window.location.href.split('?')[0]} data-numposts="5"></div>
    );
  }
}

// Actions required to provide data for this component to render in sever side.

// Retrieve data from store as props
export default CommentIframe;
