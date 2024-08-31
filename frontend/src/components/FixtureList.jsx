import { useMemo, useState } from "react";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { useGetQuery } from "../slices/teamApiSlice"
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import Pagination from "./Pagination"
import getTime from "../utils/getTime";
const FixtureList = () => {
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: fixtures, isLoading}  = useGetFixturesQuery()
  const { data: teams } = useGetQuery()
  const { data: matchdays} = useGetMatchdaysQuery()
  console.log(fixtures)
  console.log(teams)
  console.log(matchdays)
  return <div>FixtureList</div>;
};

export default FixtureList;
