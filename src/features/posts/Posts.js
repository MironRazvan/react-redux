import React from "react"
import { useSelector } from "react-redux"
import { selectPosts } from "./postSlice"
import { nanoid } from "nanoid"
import Message from "../Message"
import { Spinner } from "react-bootstrap"

function Posts(props) {
	const posts = useSelector(selectPosts)

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
