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
    updateMatchdayData: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/updateMdData/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Matchday']
    }),
    updateMatchdayTOW: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/updateTOW/${id}`,
        method: 'PUT'
      }),
      invalidatesTags: ['Matchday']
    }),
    getMaxId: builder.query({
      query: () => ({
        url: `${MATCHDAYS_URL}/data/max`,
        method: 'GET'
      }),
    }),
    getMatchdayTOW: builder.query({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/data/tows/${id}`,
        method: 'GET'
      }),
    }),
    getAllTOWs: builder.query({
      query: () => ({
        url: `${MATCHDAYS_URL}/data/tows`,
        method: 'GET'
      }),
    }),
    createAutosForMd: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/createautos/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Matchday']
    }),
    endMatchdayData: builder.mutation({
      query: (id) => ({
        url: `${MATCHDAYS_URL}/endmatchday/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Matchday']
    })
  }),
});

export const {
  useCreateAutosForMdMutation,
  useEndMatchdayDataMutation,
  useUpdateMatchdayDataMutation,
  useUpdateMatchdayTOWMutation,
  useGetMatchdayTOWQuery,
  useGetAllTOWsQuery,
  useGetMaxIdQuery,
  useGetMatchdaysQuery,
  useGetMatchdayQuery,
  useAddMatchdayMutation,
  useStartMatchdayMutation,
  useEditMatchdayMutation,
  useDeleteMatchdayMutation,
} = matchdayApiSlice;
