// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import signinReducer from './slice/signinSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  signin: signinReducer,
  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;