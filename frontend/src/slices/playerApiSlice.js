import { apiSlice } from "./apiSlice";
const PLAYERS_URL = "/api/players";

export const playerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.query({
      query: () => ({
        url: `${PLAYERS_URL}`,
      }),
      providesTags: ['Player']
    }),
    getPlayer: builder.query({
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
      invalidatesTags: ['Player']
    }),
    editPlayer: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${PLAYERS_URL}/${id}`,
        method: "PATCH",
        body: rest, 
      }), 
      invalidatesTags: ['Player']
    }),
    deletePlayer: builder.mutation({
      query: (id) => ({
        url: `${PLAYERS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Player']
    }),
    getHistory: builder.query({
      query: (id) => {
        return {
          url: `${PLAYERS_URL}/${id}/history`
        }
      }
    })
  }),
});

export const {
  useGetPlayersQuery,
  useGetPlayerQuery,
  useAddPlayerMutation,
  useGetHistoryQuery,
  useEditPlayerMutation,
  useDeletePlayerMutation,
  useGetSomeQuery
} = playerApiSlice; 
