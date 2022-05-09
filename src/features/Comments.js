import React, { useEffect, useRef, useState } from "react"
import Header from "./Header"
import Footer from "./Footer"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Card, Form, Modal } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import {
	addNewComment,
	fetchFollowedPosts,
	fetchMyPosts,
	selectPosts,
} from "./posts/postSlice"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { selectFollows } from "./follows/followsSlice"
import { nanoid } from "nanoid"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import AddCircleIcon from "@mui/icons-material/AddCircle"

const INITIAL_STATE = {
	body: "",
	comments: [],
	image: "",
	likes: [{}],
	time: "",
	userHandle: "",
	userID: "",
}

function Comments(props) {
	const [user, loading] = useAuthState(auth)
	const navigate = useNavigate()
	const location = useLocation()
	const { post } = location.state
	const dispatch = useDispatch()
	const [currentPicture, setCurrentPicture] = useState("")
	const [currentPost, setCurrentPost] = useState(INITIAL_STATE)
	const [currentName, setCurrentName] = useState("")
	const [showFullPicture, setShowFullPicture] = useState(false)
	const [flag, setFlag] = useState(false)
	const follows = useSelector(selectFollows)
	const posts = useSelector(selectPosts)
	const newComment = useRef()

	const DIVISIONS = [
		{ amount: 60, name: "seconds" },
		{ amount: 60, name: "minutes" },
		{ amount: 24, name: "hours" },
		{ amount: 7, name: "days" },
		{ amount: 4.34524, name: "weeks" },
		{ amount: 12, name: "months" },
		{ amount: Number.POSITIVE_INFINITY, name: "years" },
	]

	const RELATIVE_DATE_FORMATTER = new Intl.RelativeTimeFormat(undefined, {
		numeric: "auto",
	})

	function formatRelativeDate(toDate, fromDate = new Date()) {
		let duration = (toDate - fromDate) / 1000

		for (let i = 0; i < DIVISIONS.length; i++) {
			const division = DIVISIONS[i]
			if (Math.abs(duration) < division.amount) {
				return RELATIVE_DATE_FORMATTER.format(
					Math.round(duration),
					division.name
				)
			}
			duration /= division.amount
		}
	}

	useEffect(() => {
		let ignore = false

		if (!user && !loading) navigate("/login")

		if (!follows.loading && follows.friendInfo) {
			if (!ignore && !currentPicture) {
				follows.friendInfo.forEach((friend) => {
					if (friend.userID === post.userID) {
						setCurrentPicture(friend.profileIMG)
						setCurrentName(friend.name)
						return
					}
				})
			}
		}
		if (posts.posts) {
			posts.posts.forEach((newPost) => {
				if (
					newPost.userID === post.userID &&
					newPost.body === post.body &&
					newPost.image === post.image
				) {
					setCurrentPost(newPost)
				}
			})
		}

		return () => {
			ignore = true
		}
	}, [user, loading, flag, posts.loading, posts.posts.comments])

	useEffect(() => {
		if (!user) return
		dispatch(fetchFollowedPosts(user.uid))
	}, [user, flag])

	function handleUsernameClick(event, username, userID) {
		event.preventDefault()
		dispatch(fetchMyPosts(userID))
		if (userID === user.uid) {
			navigate("/mypage")
			return
		}
		navigate("/userpage", {
			state: { username: username, userID: userID },
		})
	}

	async function handleNewComment(event) {
		event.preventDefault()
		if (!newComment.current.value) return

		// create comment object

		// fetch current user profile from redux state
		let currentUserInfo
		follows.friendInfo.forEach((account) => {
			if (account.userID === user.uid) {
				currentUserInfo = account
			}
		})
		dispatch(
			addNewComment({
				post: post,
				profileIMG: currentUserInfo.profileIMG,
				name: currentUserInfo.name,
				userID: user.uid,
				handle: currentUserInfo.handle,
				comment: newComment.current.value,
			})
		)
		setFlag((prevFlag) => !prevFlag)
		try {
			document.getElementById("actual-input").value = null
		} catch (error) {}
	}

	return (
		<>
			<Modal
				size="lg"
				show={showFullPicture}
				onHide={() => setShowFullPicture(false)}
				aria-labelledby="full-picture-modal"
				centered
			>
				<Modal.Body>
					<div style={{ display: "grid", height: "100%" }}>
						<img
							src={post.image}
							style={{
								maxWidth: "100%",
								maxHeight: "100vh",
								margin: "auto",
							}}
							alt="full size image"
						/>
					</div>
				</Modal.Body>
			</Modal>

			<Header />
			<Card className="post--container mt-3" text="light">
				<h6
					className="post--container--header card-header w-100 d-flex"
					style={{ borderBottomWidth: 0 }}
					onClick={(e) =>
						handleUsernameClick(e, post.userHandle, post.userID)
					}
				>
					<img
						src={
							currentPicture
								? currentPicture
								: "https://www.fillmurray.com/g/300/200"
						}
						style={{
							width: "2rem",
							height: "2rem",
							objectFit: "cover",
							borderRadius: "50%",
							marginRight: "0.5rem",
							cursor: "pointer",
							boxShadow: "0px 0px 0px 1px white",
						}}
						alt="user profile"
					/>
					<div>
						<p style={{ cursor: "pointer" }}>
							<b className="mb-0">{currentName}</b>
							<span className="text-muted mb-0">
								(@{post.userHandle})
							</span>
						</p>
						<span className="text-muted">
							({formatRelativeDate(post.time * 1000)})
						</span>
					</div>
				</h6>
				<Card.Body
					style={{ backgroundColor: "var(--custom-card-body)" }}
				>
					<ArrowBackIcon
						style={{
							position: "absolute",
							top: "50%",
							left: "-10%",
							cursor: "pointer",
						}}
						onClick={() => navigate(-1)}
					/>
					<Card.Title className="post--container--body">
						{post.body}
						{post.image && (
							<div
								style={{
									position: "relative",
									width: "100%",
									marginTop: post.body && "1rem",
								}}
								onClick={() => setShowFullPicture(true)}
							>
								<img
									className="postMessage--imgPreview"
									style={{
										cursor: "pointer",
										maxWidth: "100%",
										maxHeight: "50vh",
										position: "relative",
										left: "50%",
										transform: "translateX(-50%)",
									}}
									src={post.image}
									alt="post"
								/>
							</div>
						)}
					</Card.Title>
				</Card.Body>
			</Card>
			<Form onSubmit={handleNewComment}>
				<Form.Group className="add--comment--container">
					<Form.Control
						type="text"
						id="actual-input"
						placeholder="Add comment..."
						ref={newComment}
					></Form.Control>
					<Button variant="link" onClick={(e) => handleNewComment(e)}>
						<AddCircleIcon />
					</Button>
				</Form.Group>
			</Form>
			{/* comments area */}
			{/* comment body: profileIMG, name, handle, time, body */}
			{currentPost && currentPost.comments.length > 0 ? (
				<Card className="comments--container">
					{currentPost.comments.map((comment) => {
						return (
							<div key={nanoid()}>
								<h6
									className="card-header"
									style={{ borderBottomWidth: 0 }}
									onClick={(e) => {
										handleUsernameClick(
											e,
											comment.handle,
											comment.userID
										)
									}}
								>
									<img
										src={comment.profileIMG}
										style={{
											width: "3rem",
											height: "3rem",
											objectFit: "cover",
											borderRadius: "50%",
											marginRight: "0.5em",
											cursor: "pointer",
											boxShadow: "0px 0px 0px 1px white",
										}}
									/>
									<div className="commenter--container">
										<p className="commenter--info">
											<b className="mb-0">
												{comment.name}
												<span className="text-muted mb-0">
													(@{comment.handle})
												</span>
											</b>
											<span className="text-muted mb-0">
												{formatRelativeDate(
													comment.time.seconds * 1000
												)}
											</span>
										</p>
										<p className="mb-0 mt-0">
											{comment.comment}
										</p>
									</div>
								</h6>
								{currentPost.comments.length > 1 && <hr />}
							</div>
						)
					})}
				</Card>
			) : (
				<div
					className="post--error--container alert alert-info"
					role="alert"
				>
					<h4 className="alert-heading">No comments yet</h4>
					You could be the first one to leave a comment ;)
				</div>
			)}
			<Footer />
		</>
	)
}

export default Comments
