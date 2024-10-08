import { apiSlice } from "./apiSlice";
const PICKS_URL = "/api/picks";

export const picksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    setPicks: builder.mutation({
      query: (data) => ({
        url: `${PICKS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pick"],
    }),
    getPicks: builder.query({
      query: () => ({
        url: `${PICKS_URL}`,
        method: "GET",
      }),
      providesTags: ["Pick"],
    }),

    updatePicks: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `${PICKS_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Pick", "Player"],
    }),
  }),
});

export const { useSetPicksMutation, useGetPicksQuery, useUpdatePicksMutation } =
  picksApiSlice;
