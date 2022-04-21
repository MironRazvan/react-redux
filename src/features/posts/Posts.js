import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
	fetchFollowedAccounts,
	fetchFollowedPosts,
	selectPosts,
} from "./postSlice"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../../firebase/firebase"
import { nanoid } from "nanoid"
import Message from "../Message"
import { Alert } from "bootstrap"

function Posts() {
	const dispatch = useDispatch()
	const posts = useSelector(selectPosts)
	const [user] = useAuthState(auth)

	useEffect(() => {
		// dispatch(fetchFollowedAccounts(user.uid))
		// dispatch(fetchFollowedPosts(user.uid))
	}, [posts.posts.length])

	function show() {}

	return (
		<>
			{posts.posts.length ? (
				posts.posts
					.slice()
					.sort((a, b) => parseFloat(b.time) - parseFloat(a.time))
					.map((post) => {
						return <Message key={nanoid()} array={post} />
					})
			) : (
				<div
					className="post--error--container alert alert-info"
					role="alert"
				>
					<h4 className="alert-heading">No posts to show</h4>
					You can try searching for people you know and follow them.
				</div>
			)}
		</>
	)
}

export default Posts
