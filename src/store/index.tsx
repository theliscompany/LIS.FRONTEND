import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import masterdataReducer from './masterdata.slice';

export const store = configureStore({
    reducer:{
        masterdata: masterdataReducer,
    }
})

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;