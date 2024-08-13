import { apiSlice } from "./apiSlice";
const TEAMS_URL = "/api/teams";

export const teamApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    get: builder.mutation({
      query: () => ({
        url: `${TEAMS_URL}`,
      }),
    }),
    getTeam: builder.mutation({
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
    }),
    edit: builder.mutation({
      query: (teamId) => ({
        url: `${TEAMS_URL}/${teamId}`,
        method: "PUT",
      }),
    }),
    delet: builder.mutation({
      query: (teamId) => ({
        url: `${TEAMS_URL}/${teamId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMutation,
  useGetTeamMutation,
  useAddMutation,
  useEditMutation,
  useDeletMutation,
} = teamApiSlice;
