import { apiSlice } from "./apiSlice";
const PICKS_URL = "/api/picks"

export const picksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        setPicks: builder.mutation({
            query: (data) => ({
                url: `${PICKS_URL}`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Pick']
        }),
        getPicks: builder.query({
            query: () => ({
                url: `${PICKS_URL}`,
                method: 'GET'
            }),
            providesTags: ['Pick']
        })
    })
}  
)

export const { useSetPicksMutation, useGetPicksQuery } = picksApiSlice