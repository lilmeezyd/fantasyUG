import { apiSlice } from "./apiSlice";
const TEAMS_URL = "/api/teams";
export const teamApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    get: builder.query({
      query: () => ({
        url: `${TEAMS_URL}`
      }),
      providesTags: ['Team']
    }),
    getTeam: builder.query({
      query: (teamId) => ({
        url: `${TEAMS_URL}/${teamId}`
      })
    }),
    add: builder.mutation({
      query: (data) => ({
        url: `${TEAMS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Team']
    }),
    edit: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${TEAMS_URL}/${id}`,
        method: "PATCH",
        body: rest
      }),
      invalidatesTags: ['Team']
    }), 
    delet: builder.mutation({
      query: (teamId) => ({
        url: `${TEAMS_URL}/${teamId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Team']
    }),
  }),
});

export const {
  useGetQuery,
  useGetTeamQuery,
  useAddMutation,
  useEditMutation,
  useDeletMutation,
} = teamApiSlice;
