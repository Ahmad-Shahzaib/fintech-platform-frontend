// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import kycReducer from './slice/kycSlice';
import signinReducer from './slice/signinSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,
  signin: signinReducer,
  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 