import { apiSlice } from "./apiSlice";
const LEAGUES_URL = "/api/leagues";

export const leagueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeagues: builder.mutation({
      query: () => ({
        url: `${LEAGUES_URL}`,
      }),
    }),
    getLeague: builder.mutation({
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
    }),
    editLeague: builder.mutation({
      query: (data, id) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteLeague: builder.mutation({
      query: (id) => ({
        url: `${LEAGUES_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetLeaguesMutation,
  useGetLeagueMutation,
  useAddLeagueMutation,
  useEditLeagueMutation,
  useDeleteLeagueMutation,
} = leagueApiSlice;
