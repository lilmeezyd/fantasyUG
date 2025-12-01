import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from "../slices/authSlice";

const isProd = import.meta.env.MODE === 'production';

const baseUrl = isProd
  ? import.meta.env.VITE_PROD_API_URL
  : import.meta.env.VITE_DEV_API_URL;

const baseQuery = fetchBaseQuery({baseUrl, credentials: 'include'})
//const baseQuery = fetchBaseQuery({baseUrl: ''})

const baseQueryWithAuth = async (args, api, extra) => {
  const result = await baseQuery(args, api, extra)
  if (result?.error?.status === 401) {
      api.dispatch(logout());
      api.dispatch(apiSlice.util.resetApiState());
    }
    return result;

}

export const apiSlice = createApi({
    baseQuery: baseQueryWithAuth,
    tagTypes: ['User', 'Team', 'Position', 'Player', 'Matchday', 'Fixture', 'League',
        'TeamLeague', 'OverallLeague', 'Pick', 'ManagerInfo', 'Live', 'Transfer'
    ],
    endpoints: (builder) => ({})
})