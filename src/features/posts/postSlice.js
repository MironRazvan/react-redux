import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
	updateDoc,
	deleteDoc,
	arrayUnion,
	arrayRemove,
	addDoc,
} from "firebase/firestore"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "../../firebase/firebase"
import { db } from "../../firebase/firebase"

const initialState = {
	loading: false,
	posts: [],
	follows: [],
	error: "",
}

export const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFollowedPosts.pending, (state) => {
				return {
					...state,
					loading: true,
				}
			})
			.addCase(fetchFollowedAccounts.pending, (state) => {
				return {
					...state,
					loading: true,
				}
			})
			.addCase(addNewMessage.fulfilled, (state, action) => {
				return {
					...state,
					posts: state.posts.concat(action.payload),
				}
			})
			.addCase(deleteMessage.pending, (state) => {
				return {
					...state,
					loading: true,
				}
			})
			.addCase(deleteMessage.fulfilled, (state, action) => {
				switch (action.payload.type) {
					case "MESSAGE":
						var searchKey = {
							userID: action.payload.userID,
							message: action.payload.message,
						}
						return {
							...state,
							posts: state.posts.filter((post) => {
								for (var key in searchKey) {
									if (post[key] != searchKey[key]) return true
									return false
								}
							}),
						}
					case "IMAGE":
						var searchKey = {
							userID: action.payload.userID,
							image: action.payload.image,
						}
						return {
							...state,
							posts: state.posts.filter((post) => {
								for (var key in searchKey) {
									if (post[key] != searchKey[key]) return true
									return false
								}
							}),
						}
				}
			})
			.addCase(fetchFollowedAccounts.fulfilled, (state, action) => {
				return {
					...state,
					loading: false,
					follows: action.payload,
				}
			})
			.addCase(fetchFollowedPosts.fulfilled, (state, action) => {
				return {
					...state,
					loading: false,
					posts: action.payload,
				}
			})
			.addCase(fetchMyPosts.fulfilled, (state, action) => {
				return {
					...state,
					loading: false,
					posts: action.payload,
				}
			})
			.addCase(handleFollowState.fulfilled, (state, action) => {
				switch (action.payload.action) {
					case "ADD":
						return {
							...state,
							follows: state.follows.concat(
								action.payload.userID
							),
						}
					case "REMOVE":
						return {
							...state,
							follows: state.follows.filter(
								(accountID) =>
									accountID != action.payload.userID
							),
						}
					default:
						return state
				}
			})
			.addCase(addLikeToPost.fulfilled, (state, action) => {
				switch (action.payload.action) {
					case "REMOVE":
						return {
							...state,
							posts: state.posts.map((post) => {
								if (post.body === action.payload.message) {
									return {
										...post,
										likes: post.likes.filter(
											(likeIDs) =>
												likeIDs != action.payload.myID
										),
									}
								} else {
									return post
								}
							}),
						}
					case "ADD":
						return {
							...state,
							posts: state.posts.map((post) => {
								if (post.body === action.payload.message) {
									return {
										...post,
										likes: post.likes.concat(
											action.payload.myID
										),
									}
								} else {
									return post
								}
							}),
						}
					default:
						return state
				}
			})
			.addCase(fetchFollowedPosts.rejected, (state) => {
				return {
					...state,
					loading: false,
					error: "Error loading feed",
				}
			})
	},
})

async function fetchFollowList(ID) {
	const docUserInfo = doc(db, `user_info/${ID}`)
	const docInfo = await getDoc(docUserInfo)
	return docInfo.data().follows
}

async function fetchMessages(ID) {
	const followList = await fetchFollowList(ID)
	let messageList = []
	for (const friendID in followList) {
		const myQuery = query(
			collection(db, "user_posts"),
			where("userID", "==", followList[friendID])
		)
		const querySnap = await getDocs(myQuery)
		querySnap.forEach((doc) => {
			// const info = doc.data()
			// messageList = messageList.concat(info)
			messageList.push({
				userID: doc.data().userID,
				userHandle: doc.data().handle,
				userProfileIMG: doc.data().profileIMG,
				body: doc.data().body,
				image: doc.data().image,
				time: doc.data().time.seconds,
				likes: doc.data().likes,
				comments: doc.data().comments,
			})
		})
	}
	return messageList
}

async function handleLikeClick(myID, userID, userMessage) {
	// if is our own post
	if (userID == myID) return { action: "" }

	// get message id so we can update it
	const q = query(
		collection(db, "user_posts"),
		where("userID", "==", `${userID}`),
		where("body", "==", `${userMessage}`)
	)

	let postID = ""
	let isLiked = false
	const querySnapshot = await getDocs(q)
	querySnapshot.forEach((doc) => {
		postID = doc.id
		isLiked = doc.data().likes.includes(myID)
	})

	// post reference
	const postRef = doc(db, "user_posts", `${postID}`)

	// check if user has already liked the post
	if (isLiked === true) {
		// remove the like
		await updateDoc(postRef, {
			likes: arrayRemove(`${myID}`),
		})
		return {
			myID: myID,
			userID: userID,
			message: userMessage,
			action: "REMOVE",
		}
	}
	// adds a like
	await updateDoc(postRef, {
		likes: arrayUnion(`${myID}`),
	})
	return { myID: myID, userID: userID, message: userMessage, action: "ADD" }
}

async function fetchMyMessages(ID) {
	let messageList = []
	const myQuery = query(
		collection(db, "user_posts"),
		where("userID", "==", ID)
	)
	const querySnap = await getDocs(myQuery)
	querySnap.forEach((doc) => {
		// const info = doc.data()
		// messageList = messageList.concat(info)
		messageList.push({
			userID: doc.data().userID,
			userHandle: doc.data().handle,
			userProfileIMG: doc.data().profileIMG,
			body: doc.data().body,
			image: doc.data().image,
			time: doc.data().time.seconds,
			likes: doc.data().likes,
			comments: doc.data().comments,
		})
	})
	return messageList
}

async function handleFollow(myID, userID, followState) {
	const followersRef = doc(db, "user_info", `${myID}`)

	if (!followState) {
		// adds a new follower
		await updateDoc(followersRef, {
			follows: arrayUnion(`${userID}`),
		})
		return { userID: userID, action: "ADD" }
	}
	// removes follower
	await updateDoc(followersRef, {
		follows: arrayRemove(`${userID}`),
	})
	return { userID: userID, action: "REMOVE" }
}

async function fetchPostID(userID, message, image) {
	let q
	image
		? (q = query(
				collection(db, "user_posts"),
				where("userID", "==", `${userID}`),
				where("image", "==", `${image}`)
		  ))
		: (q = query(
				collection(db, "user_posts"),
				where("userID", "==", `${userID}`),
				where("body", "==", `${message}`)
		  ))
	const snap = await getDocs(q)
	let id
	snap.forEach((doc) => (id = doc.id))
	return id
}

async function handleMessageDelete(userID, message, image) {
	// delete post from user_posts
	const postID = await fetchPostID(userID, message, image)
	if (image) {
		// if the post also has a picture, make sure to delete the picture from storage
		// firstly, get the image url
		// (the string is always formatted the same way so this method of splitting the string works)
		const imageURL = image.split("%2F")[2].split("?alt=")[0]
		// create a ref to the image
		const imageRef = ref(storage, `users_uploads/${userID}/${imageURL}`)
		deleteObject(imageRef)
		await deleteDoc(doc(db, "user_posts", `${postID}`))
		return { userID: userID, image: image, type: "IMAGE" }
	}
	await deleteDoc(doc(db, "user_posts", `${postID}`))
	return { userID: userID, message: message, type: "MESSAGE" }
}

export const fetchFollowedAccounts = createAsyncThunk(
	"fetchFollowedAccounts",
	async (userID) => {
		return await fetchFollowList(userID)
	}
)

export const handleFollowState = createAsyncThunk(
	"handleFollowState",
	async ({ myID, userID, followState }) => {
		return await handleFollow(myID, userID, followState)
	}
)

export const addLikeToPost = createAsyncThunk(
	"addLikeToPost",
	async ({ myID, userID, message }) => {
		return await handleLikeClick(myID, userID, message)
	}
)

export const fetchFollowedPosts = createAsyncThunk(
	"fetchFollowedPosts",
	async (userID) => {
		return await fetchMessages(userID)
	}
)

export const fetchMyPosts = createAsyncThunk("fetchMyPosts", async (userID) => {
	return await fetchMyMessages(userID)
})

export const addNewMessage = createAsyncThunk(
	"addNewPost",
	async ({ userID, handle, handleLowercase, profileIMG, body, image }) => {
		return await addDoc(collection(db, "user_posts"), {
			userID: userID,
			handle: handle,
			handle_lowercase: handleLowercase,
			profileIMG: profileIMG,
			time: new Date(),
			body: body,
			image: image,
			likes: [`${userID}`],
			comments: [],
		})
	}
)

export const deleteMessage = createAsyncThunk(
	"deleteMessage",
	async ({ userID, message, image }) => {
		return await handleMessageDelete(userID, message, image)
	}
)

export const selectPosts = (state) => state.posts

export default postsSlice.reducer
