import { apiSlice } from "./apiSlice";
const MATCHDAYS_URL = "/api/matchdays";

export const matchdayApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMatchdays: builder.mutation({
      query: () => ({
        url: `${MATCHDAYS_URL}`,
      }),
    }),
    getMatchday: builder.mutation({
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
    }),
    editMatchday: builder.mutation({
      query: (data, id) => ({
        url: `${MATCHDAYS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteMatchday: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMatchdaysMutation,
  useGetMatchdayMutation,
  useAddMatchdayMutation,
  useEditMatchdayMutation,
  useDeleteMatchdayMutation,
} = matchdayApiSlice;
