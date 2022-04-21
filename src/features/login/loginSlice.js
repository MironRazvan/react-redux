import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { logInWithEmailAndPassword, logout } from "../../firebase/firebase"

const initialState = {
	loading: false,
	isSet: false,
	error: "",
}

export const loginSlice = createSlice({
	name: "login",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.loading = true
				state.isSet = false
				state.error = ""
			})
			.addCase(login.fulfilled, (state) => {
				state.loading = false
				state.isSet = true
				state.error = ""
			})
			.addCase(login.rejected, (state) => {
				state.loading = false
				state.isSet = false
				state.error = "Unable to log in"
			})
			.addCase(signout.pending, (state) => {
				state.loading = true
			})
			.addCase(signout.fulfilled, (state) => {
				state.loading = false
				state.isSet = false
			})
	},
})

export const login = createAsyncThunk(
	"userLogin",
	async ({ email, password }) => {
		await logInWithEmailAndPassword(email, password)
	}
)

export const signout = createAsyncThunk("userLogout", async () => {
	await logout()
})

export const selectUser = (state) => state.user

export default loginSlice.reducer
