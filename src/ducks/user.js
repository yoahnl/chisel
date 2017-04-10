import {Parse} from 'parse';

import {UserData} from 'models/UserData';


export const LOGIN_REQUEST      = 'app/user/LOGIN_REQUEST';
export const LOGIN_RESPONSE     = 'app/user/LOGIN_RESPONSE';
export const REGISTER_REQUEST   = 'app/user/REGISTER_REQUEST';
export const REGISTER_RESPONSE  = 'app/user/REGISTER_RESPONSE';
export const LOGOUT             = 'app/user/LOGOUT';
export const UPDATE             = 'app/user/UPDATE';
export const UPDATE_PASSWORD    = 'app/user/UPDATE_PASSWORD';

export const ERROR_USER_EXISTS  = 'app/user/ERROR_USER_EXISTS';
export const ERROR_WRONG_PASS   = 'app/user/ERROR_WRONG_PASS';


export function register(email, password) {
  return dispatch => {
    dispatch({
      type: REGISTER_REQUEST,
      email,
      password
    });

    let user = new Parse.User();
    user.set("username", email);
    user.set("email", email);
    user.set("password", password);
    user
      .signUp()
      .then(() => {
        Parse.User.logIn(email, password)
          .then(() => {
            localStorage.setItem('authorization', JSON.stringify({email, password}));
            let userData = new UserData().setOrigin();
            dispatch({
              type: LOGIN_RESPONSE,
              authorized: true,
              userData
            });
          }, () => {
            console.log('FATAL ERROR!!! AAAAAA!!!');
          });
      }, () => {
        dispatch({
          type: REGISTER_RESPONSE,
          authError: ERROR_USER_EXISTS
        });
      });
  };
}

export function login(email, password) {
  return dispatch => {
    dispatch({
      type: LOGIN_REQUEST,
      email,
      password
    });

    Parse.User.logIn(email, password)
      .then(() => {
        localStorage.setItem('authorization', JSON.stringify({email, password}));
        let userData = new UserData().setOrigin();
        dispatch({
          type: LOGIN_RESPONSE,
          authorized: true,
          userData
        });
      }, () => {
        dispatch({
          type: LOGIN_RESPONSE,
          authError: ERROR_WRONG_PASS
        });
      });
  };
}

export function loginOrRegister(email, password) {
  return dispatch => {
    dispatch({
      type: LOGIN_REQUEST,
      email,
      password
    });

    Parse.User.logIn(email, password)
      .then(() => {
        localStorage.setItem('authorization', JSON.stringify({email, password}));
        let userData = new UserData().setOrigin();
        dispatch({
          type: LOGIN_RESPONSE,
          authorized: true,
          userData
        });
        
      }, () => {
        let user = new Parse.User();
        user.set("username", email);
        user.set("email", email);
        user.set("password", password);
        user.set("firstName", "Jack");
        user.set("lastName", "Daniel");
        user
          .signUp()
          
          .then(() => {
            Parse.User.logIn(email, password)
              .then(() => {
                localStorage.setItem('authorization', JSON.stringify({email, password}));
                let userData = new UserData().setOrigin();
                dispatch({
                  type: LOGIN_RESPONSE,
                  authorized: true,
                  userData
                });
              }, () => {
                console.log('FATAL ERROR!!! AAAAAA!!!');
              });
            
          }, () => {
            dispatch({
              type: LOGIN_RESPONSE,
              authError: ERROR_WRONG_PASS
            });
          });
      });
  };
}

export function getLocalStorage() {
  let authStr = localStorage.getItem('authorization');
  if (!authStr)
    return {type: LOGIN_RESPONSE};
  
  return dispatch => {
    let auth = JSON.parse(authStr);
    dispatch({
      type: LOGIN_REQUEST,
      email: auth.email,
      password: auth.password
    });

    Parse.User.logIn(auth.email, auth.password)
      .then(() => {
        let userData = new UserData().setOrigin();
        dispatch({
          type: LOGIN_RESPONSE,
          authorized: true,
          userData
        });
      }, () => {
        dispatch({type: LOGIN_RESPONSE});
      });
  };
}

export function logout() {
  localStorage.setItem('authorization', '');
  Parse.User.logOut();
  
  return {type: LOGOUT};
}

export function update(data) {
  data.updateOrigin();
  data.origin.save();
  
  const {email} = data;
  let authStr = localStorage.getItem('authorization');
  let password = JSON.parse(authStr).password;
  localStorage.setItem('authorization', JSON.stringify({email, password}));
  
  return {
    type: UPDATE,
    data
  };
}

export function updatePassword(password) {
  if (!password)
    return null;
  
  let userData = Parse.User.current();
  userData.set(`password`, password);
  userData.save();
  
  let email = userData.get('email');
  localStorage.setItem('authorization', JSON.stringify({email, password}));
  
  return {type: UPDATE_PASSWORD};
}

const initialState = {
  localStorageReady: false,
  fetchingRequest: false,

  authorized: false,
  authError: null,

  email: '',
  password: '',

  userData: null
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {

    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return {
        ...state,
        fetchingRequest: true,
        authorized: false,
        authError: null,
        email: action.email,
        password: action.password
      };

    case LOGIN_RESPONSE:
    case REGISTER_RESPONSE:
      let result = {
        ...state,
        fetchingRequest: false,
        authorized: action.authorized,
        authError:  action.authError,
        userData:   action.userData,
        localStorageReady: true
      };
      return result;

    case LOGOUT:
      return {
        ...state,
        authorized: false
      };
      
    case UPDATE:
      return {
        ...state,
        userData: action.data
      };
  
    case UPDATE_PASSWORD:
      return {...state};
      
    default:
      return state;
  }
}