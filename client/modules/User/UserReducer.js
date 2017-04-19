import { ADD_USER } from './UserActions';

// Initial State
const initialState = { user: null };

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER:
      return { ...state, user: action.user };
    default:
      return state;
  }
};

/* Selectors */
// Get user
export const getUser = (state) => {
  return state.users.user;
};
// Export Reducer
export default UserReducer;
