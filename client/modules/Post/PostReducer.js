import { ADD_POST, RESET_POST, ADD_POSTS, DELETE_POST } from './PostActions';

// Initial State
const initialState = { data: [], currentPost: null };

const PostReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST :
      return {
        ...state, currentPost: action.post,
      };
    case RESET_POST :
      return {
        ...state, currentPost: null
      };
    case ADD_POSTS :
      return {
        data: action.posts,
      };

    case DELETE_POST :
      return {
        data: state.data.filter(post => post.cuid !== action.cuid),
      };

    default:
      return state;
  }
};

/* Selectors */

// Get all posts
export const getPosts = state => state.posts.data;

// Get post by cuid
export const getPost = (state) => state.posts.currentPost || { cuid: '', title: '', content: '', name: '', slug: '' };

// Export Reducer
export default PostReducer;
