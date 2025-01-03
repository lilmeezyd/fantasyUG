import { apiSlice } from "./apiSlice";
const LIVE_PICKS_URL = '/api/livepicks/manager'

export const livePicksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLivePicks: builder.query({
            query: (id) => ({
                url: `${LIVE_PICKS_URL}/${id}`
            }),
            providesTags: ['Live']
        },
        ),
        setLivePicks: builder.mutation({
            query: () => ({
                url: `${LIVE_PICKS_URL}`,
                method: 'PATCH'
            }),
            invalidatesTags: ['Live']
        }),
        setInitialPoints: builder.mutation({
            query: (data) => {
                const { y, x } = data
                return {
                    url: `${LIVE_PICKS_URL}/matchday/${y}/start/fixtures/${x}`,
                    method: 'PATCH'
                }
            },
            invalidatesTags: ['Live']
        })
    })
})

export const { useGetLivePicksQuery, useSetLivePicksMutation, useSetInitialPointsMutation } = livePicksApiSlice