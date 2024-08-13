import { apiSlice } from "./apiSlice";
const PLAYERS_URL = "/api/players";

export const playerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.mutation({
      query: () => ({
        url: `${PLAYERS_URL}`,
      }),
    }),
    getPlayer: builder.mutation({
      query: (id) => ({
        url: `${PLAYERS_URL}/${id}`
      })
    }),
    addPlayer: builder.mutation({
      query: (data) => ({
        url: `${PLAYERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    editPlayer: builder.mutation({
      query: (data, id) => ({
        url: `${PLAYERS_URL}/${id}`,
        method: "PUT",
        body: data, 
      }),
    }),
    deletePlayer: builder.mutation({
      query: (id) => ({
        url: `${PLAYERS_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetPlayersMutation,
  useGetPlayerMutation,
  useAddPlayerMutation,
  useEditPlayerMutation,
  useDeletePlayerMutation,
} = playerApiSlice;
