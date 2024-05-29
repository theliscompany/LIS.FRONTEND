import { createSlice, createAsyncThunk }  from '@reduxjs/toolkit'
import { protectedResources } from '../config/authConfig'
import { BackendService } from '../utils/services/fetch';

export const fetchContactBusinesses = createAsyncThunk(
    'masterdata/fetchContactBusinesses',
    async(obj: any) => {
        return await (obj?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", obj.tokenCrm);
    }
);

export const fetchPorts = createAsyncThunk(
    'masterdata/fetchPorts',
    async(obj:any) => {
        console.log("Check");
        return await (obj?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", obj.tokenTransport);
    }
);

export const fetchServices = createAsyncThunk(
    'masterdata/fetchServices',
    async(obj:any) => {
        return await (obj?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=1000", obj.tokenTransport);
    }
);

export const fetchProducts = createAsyncThunk(
    'masterdata/fetchProducts',
    async(obj:any) => {
        return await (obj?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", obj.tokenTransport);
    }
);

export const fetchAssignees = createAsyncThunk(
    'masterdata/fetchAssignees',
    async(obj:any) => {
        return await (obj?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", obj.tokenLogin);
    }
);

export const masterdataSlice = createSlice({
    name: 'masterdata',
    initialState: {
        contactBusinesses: [] as any,
        ports: [] as any,
        products: [] as any,
        services: [] as any,
    },
    reducers: {},
    extraReducers: (builder: any) => {
        builder
        .addCase(fetchContactBusinesses.fulfilled, (state: any, action: any)=>{
            state.contactBusinesses = action.payload || []
        })
        .addCase(fetchPorts.fulfilled, (state: any, action: any) => {
            state.ports = action.payload || []
        })
        .addCase(fetchProducts.fulfilled, (state: any, action: any) => {
            state.products = action.payload || []
        })
        .addCase(fetchAssignees.fulfilled, (state: any, action: any) => {
            state.assignees = action.payload || []
        })
        .addCase(fetchServices.fulfilled, (state: any, action: any) => {
            state.services = action.payload || []
            // state.miscellaneousServices = services.filter((x: any) => x.servicesTypeId.some((y: any) => y === ServiceType.MISCELLANEOUS)) || []
            // state.seaFreightServices = services.filter((x: any) => x.servicesTypeId.some((y: any) => y === ServiceType.SEAFREIGHT)) || []
        })
    }
});

export default masterdataSlice.reducer;