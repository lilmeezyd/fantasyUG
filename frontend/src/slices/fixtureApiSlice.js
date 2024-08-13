import { apiSlice } from "./apiSlice";
const FIXTURES_URL = "/api/fixtures";

export const fixtureApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFixtures: builder.mutation({
      query: () => ({
        url: `${FIXTURES_URL}`,
      }),
    }),
    getFixture: builder.mutation({
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
    }),
    editFixture: builder.mutation({
      query: (data, id) => ({
        url: `${FIXTURES_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteFixture: builder.mutation({
      query: (id) => ({
        url: `${FIXTURES_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetFixturesMutation,
  useGetFixtureMutation,
  useAddFixtureMutation,
  useEditFixtureMutation,
  useDeleteFixtureMutation,
} = fixtureApiSlice;
