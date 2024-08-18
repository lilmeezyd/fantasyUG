import { apiSlice } from "./apiSlice";
const LEAGUES_URL = "/api/leagues"; 

export const leagueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeagues: builder.query({
      query: () => ({
        url: `${LEAGUES_URL}/privateleagues`,
      }),
      providesTags: ['League']
    }),
    getOverallLeagues: builder.query({
      query: () => ({
        url: `${LEAGUES_URL}/overallleagues`,
      }),
      providesTags: ['League']
    }),
    getTeamLeagues: builder.query({
      query: () => ({
        url: `${LEAGUES_URL}/teamleagues`,
      }),
      providesTags: ['TeamLeague']
    }),
    getLeague: builder.query({
      query: (id) => ({
        url: `${LEAGUES_URL}/${id}`
      })
    }),
    getOverallLeague: builder.query({
      query: (id) => ({
        url: `${LEAGUES_URL}/overallleagues/${id}`
      })
    }),
    getTeamLeague: builder.query({
      query: (id) => ({
        url: `${LEAGUES_URL}/teamleagues/${id}`
      })
    }),
    addLeague: builder.mutation({
      query: (data) => ({
        url: `${LEAGUES_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['League']
    }),
    addOverallLeague: builder.mutation({
      query: (data) => ({
        url: `${LEAGUES_URL}/overallleagues`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['League']
    }),
    addTeamLeague: builder.mutation({
      query: (data) => ({
        url: `${LEAGUES_URL}/teamleagues`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['TeamLeague']
    }),
    editLeague: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['League']
    }),
    editOverallLeague: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${LEAGUES_URL}/overallleagues/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['OverallLeague']
    }),
    editTeamLeague: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${LEAGUES_URL}/teamleagues/${id}`, 
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['TeamLeague']
    }),
    deleteLeague: builder.mutation({
      query: (id) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['League']
    }),
    deleteOverallLeague: builder.mutation({
      query: (id) => ({
        url: `${LEAGUES_URL}/overallleagues/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['League']
    }),
    deleteTeamLeague: builder.mutation({
      query: (id) => ({
        url: `${LEAGUES_URL}/teamleagues/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['TeamLeague']
    }),
  }),
});

export const {
  useGetLeaguesQuery,
  useGetOverallLeaguesQuery,
  useGetTeamLeaguesQuery,
  useGetLeagueQuery,
  useGetOverallLeagueQuery,
  useGetTeamLeagueQuery,
  useAddLeagueMutation,
  useAddOverallLeagueMutation,
  useAddTeamLeagueMutation,
  useEditLeagueMutation,
  useEditOverallLeagueMutation,
  useEditTeamLeagueMutation,
  useDeleteLeagueMutation,
  useDeleteOverallLeagueMutation,
  useDeleteTeamLeagueMutation,
} = leagueApiSlice;