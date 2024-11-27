import { apiSlice } from "./apiSlice";
const FIXTURES_URL = "/api/fixtures";

export const fixtureApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFixtures: builder.query({
      query: () => ({
        url: `${FIXTURES_URL}`,
      }),
      providesTags: ['Fixture']
    }), 
    getFixture: builder.query({
      query: (id) => ({
        url: `${FIXTURES_URL}/${id}`
      })
    }),
    addFixture: builder.mutation({
      query: (data) => ({
        url: `${FIXTURES_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Fixture']
    }),
    editFixture: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `${FIXTURES_URL}/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ['Fixture']
    }),
    deleteFixture: builder.mutation({
      query: (id) => ({
        url: `${FIXTURES_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Fixture']
    }),
    populateFixture: builder.mutation({
      query: (id) => ({
        url: `${FIXTURES_URL}/${id}/populate`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Fixture']
    }),
    depopulateFixture: builder.mutation({
      query: (data) => {
        const {y, x} = data
        return {
        url: `${FIXTURES_URL}/${x}/depopulate/matchday/${y}`,
        method: 'PATCH'}
      },
      invalidatesTags: ['Fixture']
    }),
    editStats: builder.mutation({
      query: ({id, ...rest}) => {
        return {
        url: `${FIXTURES_URL}/${id}/stats`,
        method: 'PATCH',
        body: rest
        }
      },
      invalidatesTags: ['Fixture']
    })
  }),
});

export const {
  useGetFixturesQuery,
  useGetFixtureQuery,
  useAddFixtureMutation,
  useEditFixtureMutation,
  useDeleteFixtureMutation,
  usePopulateFixtureMutation,
  useDepopulateFixtureMutation,
  useEditStatsMutation
} = fixtureApiSlice;
