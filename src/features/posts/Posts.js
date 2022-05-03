import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectPosts } from "./postSlice"
import { nanoid } from "nanoid"
import Message from "../Message"
import { Spinner } from "react-bootstrap"
import { fetchMyPosts } from "../posts/postSlice"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../../firebase/firebase"

function Posts(props) {
	const posts = useSelector(selectPosts)
	const dispatch = useDispatch()
	const [user] = useAuthState(auth)

	return (
		<>
			{posts.posts.length > 0 ? (
				posts.posts
					.slice()
					.sort((a, b) => parseFloat(b.time) - parseFloat(a.time))
					.map((post) => {
						return (
							<Message
								key={nanoid()}
								useCase={props.useCase}
								array={post}
							/>
						)
					})
			) : posts.loading ? (
				<div className="spinner--container">
					<Spinner animation="border" variant="info" />
				</div>
			) : props.useCase !== undefined ? (
				<div
					className="post--error--container alert alert-info"
					role="alert"
				>
					<h4 className="alert-heading">No posts to show</h4>
					You could search for people you know and follow them.
				</div>
			) : (
				<div
					className="post--error--container alert alert-info"
					role="alert"
				>
					<h4 className="alert-heading">No posts to show</h4>
					This user hasn't made any posts yet.
				</div>
			)}
		</>
	)
}

export default Posts
