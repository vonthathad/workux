import callApi from '../../util/apiCaller';

// Export Constants
export const ADD_USER = 'ADD_USER';

// Export Actions
export function addUser(user) {
  return {
    type: ADD_USER,
    user,
  };
}

export function fetchUser(token) {
  return (dispatch) => {
    // return callApi(`token?access_token=${token}`).then(res => {
    //   if (res.user) {
    //     dispatch(addUser(res.user));
    //     localStorage.setItem('token', res.user.token);
    //   }
    //   if (res.error) {
    localStorage.removeItem('token');
    location.href = location.href.split('?')[0];
    //   }
    // });
  };
}
