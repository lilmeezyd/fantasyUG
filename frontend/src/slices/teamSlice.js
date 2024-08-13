import { createSlice } from '@reduxjs/toolkit'

const initialState = {teamInfo: null
}

const teamSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setTeamDetails: (state, action) => {
            state.team = action.payload
        }
    }
})

export const { setTeamDetails } = teamSlice.actions

export default teamSlice.reducer