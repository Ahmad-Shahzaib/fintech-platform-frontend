// redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
<<<<<<< HEAD
import kycReducer from './slice/kycSlice';
=======
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
import signinReducer from './slice/signinSlice';

const rootReducer = combineReducers({
  auth: authReducer,
<<<<<<< HEAD
  kyc: kycReducer,
=======
>>>>>>> dc389fb49d188bb7b44892c1840e2c6efd14abd1
  signin: signinReducer,
  // Add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 