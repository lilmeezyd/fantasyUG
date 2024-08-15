import { apiSlice } from "./apiSlice";
const POSITIONS_URL = "/api/positions";

export const positionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPositions: builder.query({
      query: () => ({
        url: `${POSITIONS_URL}`,
      }),
      providesTags: ['Position']
    }),
    getPosition: builder.query({
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
      invalidatesTags: ['Position']
    }),
    editPosition: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${POSITIONS_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['Position']
    }),
    deletePosition: builder.mutation({
      query: (id) => ({
        url: `${POSITIONS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Position']
    }),
  }),
});

export const {
  useGetPositionsQuery,
  useGetPositionQuery,
  useAddPositionMutation,
  useEditPositionMutation,
  useDeletePositionMutation,
} = positionApiSlice;
