// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import kycReducer from './slice/kycSlice';
import adminKycReducer from './slice/adminKycSlice';
import signinReducer from './slice/signinSlice';
import userProfileReducer from './slice/userProfileSlice';
import kycStatusReducer from './slice/kycStatusSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,
  adminKyc: adminKycReducer,
  signin: signinReducer,
  userProfile: userProfileReducer,
  kycStatus: kycStatusReducer,

  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 