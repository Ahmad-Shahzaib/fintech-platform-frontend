// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import kycReducer from './slice/kycSlice';
import adminKycReducer from './slice/adminKycSlice';
import signinReducer from './slice/signinSlice';
import userProfileReducer from './slice/userProfileSlice';
import kycStatusReducer from './slice/kycStatusSlice';
import usersReducer from './slice/usersSlice';
import userDetailReducer from './slice/userDetailSlice';
import topUpReducer from './slice/topUpSlice';
import currencyReducer from './slice/currencySlice';
import topUpsReducer from './slice/topUpsSlice';
import adminTopUpsReducer from './slice/adminTopUpsSlice';
import adminAllTopUpsReducer from './slice/adminAllTopUpsSlice';
import adminTopUpDetailReducer from './slice/adminTopUpDetailSlice';
import networksReducer from './slice/networksSlice';
import currencyNetworksReducer from './slice/currencyNetworksSlice';
import currencyNetworkDetailReducer from './slice/currencyNetworkSlice';
import currencyNetworkCreateReducer from './slice/currencyNetworkCreateSlice';
import currencyNetworkUpdateReducer from './slice/currencyNetworkUpdateSlice';

// New reducer

const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,
  adminKyc: adminKycReducer,
  signin: signinReducer,
  userProfile: userProfileReducer,
  kycStatus: kycStatusReducer,
  users: usersReducer,
  userDetail: userDetailReducer,
  topUp: topUpReducer,
  currencies: currencyReducer,
  topUps: topUpsReducer,
  adminTopUps: adminTopUpsReducer,
  adminAllTopUps: adminAllTopUpsReducer,
  adminTopUpDetail: adminTopUpDetailReducer,
  networks: networksReducer,
  currencyNetworks: currencyNetworksReducer,
  currencyNetworkDetail: currencyNetworkDetailReducer,
  currencyNetworkCreate: currencyNetworkCreateReducer,
  currencyNetworkUpdate: currencyNetworkUpdateReducer,
  




  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 