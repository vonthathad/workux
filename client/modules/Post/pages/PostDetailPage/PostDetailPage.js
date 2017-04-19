import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

// Import Style
import styles from '../../components/PostListItem/PostListItem.css';

// Import Actions
import { fetchPost, resetPost } from '../../PostActions';

// Import Selectors
import { getPost } from '../../PostReducer';

export class PostDetailPage extends Component {
  static need = [params => {
    return fetchPost(params.cuid);
  }];
  static propTypes = {
    post: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      cuid: PropTypes.string.isRequired,
    }).isRequired,
    params: PropTypes.object,
    location: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
  };
  componentDidMount() {
    if (this.props.params.cuid && this.props.post.cuid === '') {
      this.props.dispatch(fetchPost(this.props.params.cuid));
    }
  }
  componentWillReceiveProps({ params }) {
    if (params.cuid !== this.props.params.cuid) {
      this.props.dispatch(resetPost());
      this.props.dispatch(fetchPost(params.cuid));
    }
  }
  componentWillUnmount() {
    this.props.dispatch(resetPost());
  }
  render() {
    return (
      <div>
        <Helmet title={this.props.post.title} />
        <div className={`${styles['single-post']} ${styles['post-detail']}`}>
          <h3 className={styles['post-title']}>{this.props.post.title}</h3>
          <p className={styles['author-name']}><FormattedMessage id="by" /> {this.props.post.name}</p>
          <p className={styles['post-desc']}>{this.props.post.content}</p>
        </div>
      </div>
    );
  }

}

// Actions required to provide data for this component to render in sever side.
// Retrieve data from store as props
const mapStateToProps = (state) => {
  return {
    post: getPost(state),
  };
};

export default connect(mapStateToProps)(PostDetailPage);
