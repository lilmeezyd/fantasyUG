import { apiSlice } from "./apiSlice";

const MANAGER_URL = "https://fantasy-ug-api.vercel.app/api/managerinfo"

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