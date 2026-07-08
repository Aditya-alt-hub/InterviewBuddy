import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import sessionReducer from '../features/sessions/sessionSlice.js'


const store=configureStore(
    {
        reducer:
        {
            auth:authReducer,
            sessions:sessionReducer,
        },
        devTools:true,
    }
);
export default store