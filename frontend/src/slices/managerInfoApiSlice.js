import { apiSlice } from "./apiSlice";

const MANAGER_URL = "/api/managerinfo"

export const managerInfoApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getManagerInfo: builder.query({
            query: () => ({
                url: `${MANAGER_URL}`,
                method: 'GET'
            }),
            providesTags: ['ManagerInfo']
        })
    })
})

export const { useGetManagerInfoQuery } = managerInfoApiSlice