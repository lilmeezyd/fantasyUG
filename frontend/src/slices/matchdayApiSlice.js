import { apiSlice } from "./apiSlice";
const MATCHDAYS_URL = "/api/matchdays";

export const matchdayApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMatchdays: builder.query({
      query: () => ({
        url: `${MATCHDAYS_URL}`,
      }), 
      providesTags: ['Matchday']
    }),
    getMatchday: builder.query({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/${id}`
      })
    }),
    addMatchday: builder.mutation({
      query: (data) => ({
        url: `${MATCHDAYS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Matchday']
    }),
    startMatchday: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/${id}`,
        method: "PATCH"
      }),
      invalidatesTags: ['Matchday']
    }),
    editMatchday: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${MATCHDAYS_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['Matchday']
    }),
    deleteMatchday: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Matchday']
    }),
  }),
});

export const {
  useGetMatchdaysQuery,
  useGetMatchdayQuery,
  useAddMatchdayMutation,
  useStartMatchdayMutation,
  useEditMatchdayMutation,
  useDeleteMatchdayMutation,
} = matchdayApiSlice;
