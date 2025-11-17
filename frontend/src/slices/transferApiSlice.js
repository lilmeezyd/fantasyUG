import { apiSlice } from "./apiSlice";
const TRANSFERS_URL = "/api/transfers";
export const transferApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTransfers: builder.query({
            query: (id) => ({
                url: `${TRANSFERS_URL}/${id}`
            }),
            providesTags: ['Transfer']
        })
    })
})

export const { useGetTransfersQuery } = transferApiSlice