// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import kycReducer from './slice/kycSlice';
import adminKycReducer from './slice/adminKycSlice';
import adminAllKycReducer from './slice/adminAllKycSlice';
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
import updatePasswordReducer from './slice/updatePasswordSlice';
import submitPaymentReducer from './slice/submitPaymentSlice';
import paymentMethodsReducer from './slice/paymentMethodsSlice';
import faqsReducer from './slice/faqsSlice';
import adminStatsReducer from './slice/adminStatsSlice';
import adminLatestTopUpsReducer from './slice/adminLatestTopUpsSlice';
import bankDetailsReducer from './slice/bankDetailsSlice';
import paypalDetailsReducer from './slice/paypalSlice';
import paymentProofsReducer from './slice/paymentProofsSlice';
import adminPaymentProofsReducer from './slice/adminPaymentProofsSlice';

// New reducer

const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer,
  adminKyc: adminKycReducer,
  adminAllKyc: adminAllKycReducer,
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
  updatePassword: updatePasswordReducer,
  submitPayment: submitPaymentReducer,
  paymentMethods: paymentMethodsReducer,
  faqs: faqsReducer,
  adminStats: adminStatsReducer,
  adminLatestTopUps: adminLatestTopUpsReducer,
  bankDetails: bankDetailsReducer,
  paypalDetails: paypalDetailsReducer,
  paymentProofs: paymentProofsReducer,
  adminPaymentProofs: adminPaymentProofsReducer,
  




  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 