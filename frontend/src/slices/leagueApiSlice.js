import { apiSlice } from "./apiSlice";
const LEAGUES_URL = "/api/leagues";

export const leagueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeagues: builder.query({
      query: () => ({
        url: `${LEAGUES_URL}`,
      }),
      providesTags: ['League']
    }),
    getLeague: builder.query({
      query: (id) => ({
        url: `${LEAGUES_URL}/${id}`
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
    editLeague: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['League']
    }),
    deleteLeague: builder.mutation({
      query: (id) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['League']
    }),
  }),
});

export const {
  useGetLeaguesQuery,
  useGetLeagueQuery,
  useAddLeagueMutation,
  useEditLeagueMutation,
  useDeleteLeagueMutation,
} = leagueApiSlice;
