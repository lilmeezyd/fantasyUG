import Hero from "../components/Hero"
import { useGetPicksQuery } from "../slices/picksSlice"
const HomeScreen = () => {
  const { data: picks } = useGetPicksQuery()
  console.log(picks)
  return (
    <Hero />
  )
}

export default HomeScreen