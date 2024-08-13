import { apiSlice } from "./apiSlice";
const POSITIONS_URL = "/api/positions";

export const positionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPositions: builder.mutation({
      query: () => ({
        url: `${POSITIONS_URL}`,
      }),
    }),
    getPosition: builder.mutation({
      query: (id) => ({
        url: `${POSITIONS_URL}/${id}`
      })
    }),
    addPosition: builder.mutation({
      query: (data) => ({
        url: `${POSITIONS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    editPosition: builder.mutation({
      query: (data, id) => ({
        url: `${POSITIONS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deletePosition: builder.mutation({
      query: (id) => ({
        url: `${POSITIONS_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetPositionsMutation,
  useGetPositionMutation,
  useAddPositionMutation,
  useEditPositionMutation,
  useDeletePositionMutation,
} = positionApiSlice;
