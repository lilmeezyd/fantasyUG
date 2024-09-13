import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({baseUrl: ''})

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Team', 'Position', 'Player', 'Matchday', 'Fixture', 'League',
        'TeamLeague', 'OverallLeague', 'Pick', 'ManagerInfo', 'Live'
    ],
    endpoints: (builder) => ({})
})