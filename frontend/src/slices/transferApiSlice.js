import { apiSlice } from "./apiSlice";
const TRANSFERS_URL = "/api/transfers";
export const transferApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTransfers: builder.query({
            query: (id) => ({
                url: `${TRANSFERS_URL}/${id}`
            }),
            providesTags: ['Transfer']
        }),
        getNextMatchdayDetails: builder.query({
            query: () => ({
                url: `${TRANSFERS_URL}/next-md-details`
            }),
            providesTags: ['Transfer']
        })
    })
})

export const { useGetTransfersQuery, useGetNextMatchdayDetailsQuery } = transferApiSlice