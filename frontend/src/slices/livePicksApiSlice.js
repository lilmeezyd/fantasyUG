import { apiSlice } from "./apiSlice";
const LIVE_PICKS_URL = '/api/livepicks/manager'

export const livePicksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLivePicks: builder.query({
            query: (id) => ({
                url: `${LIVE_PICKS_URL}/${id}`
            }),
            providesTags: ['Live']
        })
    })
})

export const { useGetLivePicksQuery } = livePicksApiSlice