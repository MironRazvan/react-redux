import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"

const initialState = {
	loading: false,
	friendInfo: [],
	error: "",
}

export const followsSlice = createSlice({
	name: "follows",
	initialState,
	reducers: {
		updateIMG(state, action) {
			state.friendInfo.find(
				(user) => user.userID === action.payload.userID
			).profileIMG = action.payload.img
		},
		updateName(state, action) {
			state.friendInfo.find(
				(user) => user.userID === action.payload.userID
			).name = action.payload.name
		},
		updateAge(state, action) {
			state.friendInfo.find(
				(user) => user.userID === action.payload.userID
			).age = action.payload.age
		},
		updateLocation(state, action) {
			state.friendInfo.find(
				(user) => user.userID === action.payload.userID
			).location = action.payload.location
		},
		updateAbout(state, action) {
			state.friendInfo.find(
				(user) => user.userID === action.payload.userID
			).about = action.payload.about
		},
		handleNewAcountInfo(state, action) {
			state.friendInfo = [action.payload]
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFollowsInfo.pending, (state) => {
				return {
					...state,
					loading: true,
				}
			})
			.addCase(fetchFollowsInfo.fulfilled, (state, action) => {
				return {
					...state,
					friendInfo: action.payload,
					loading: false,
				}
			})
	},
})

async function fetchInfo(userList) {
	const tempList = []
	for (const user in userList) {
		const docUserInfo = doc(db, `user_info/${userList[user]}`)
		const docInfo = await getDoc(docUserInfo)
		tempList.push(docInfo.data())
	}
	return tempList
}

export const fetchFollowsInfo = createAsyncThunk(
	"fetchFollowsInfo",
	async (userList) => {
		return await fetchInfo(userList)
	}
)

export const selectFollows = (state) => state.follows

export const {
	updateIMG,
	updateName,
	updateAge,
	updateLocation,
	updateAbout,
	handleNewAcountInfo,
} = followsSlice.actions

export default followsSlice.reducer
