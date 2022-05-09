import React, { useEffect, useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { Card, Modal } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/firebase"
import { useDispatch, useSelector } from "react-redux"
import AddCommentIcon from "@mui/icons-material/AddComment"
import FavoriteIcon from "@mui/icons-material/Favorite"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { addLikeToPost, deleteMessage, fetchMyPosts } from "./posts/postSlice"
import { Link, useNavigate } from "react-router-dom"
import "react-confirm-alert/src/react-confirm-alert.css"
import WarningIcon from "@mui/icons-material/Warning"
import { selectFollows } from "./follows/followsSlice"
import { Button } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Comments from "./Comments"

function Message(props) {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [showPicture, setShowPicture] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [currentPicture, setCurrentPicture] = useState("")
	const [currentName, setCurrentName] = useState("")
	const [user] = useAuthState(auth)
	const follows = useSelector(selectFollows)

	const buttonTheme = createTheme({
		palette: {
			neutral: {
				main: "#64748B",
				contrastText: "#fff",
			},
		},
	})

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

	useEffect(() => {
		let ignore = false

		if (!user) return

		const fetchProfileIMG = async (id) => {
			const docUserInfo = doc(db, `user_info/${id}`)
			const docInfo = await getDoc(docUserInfo)
			return { img: docInfo.data().profileIMG, name: docInfo.data().name }
		}

		if (!follows.loading && follows.friendInfo) {
			if (!ignore && !currentPicture) {
				// firstly, search the friend in follows state and retreive data if present
				follows.friendInfo.forEach((friend) => {
					if (friend.userID === props.array.userID) {
						setCurrentPicture(friend.profileIMG)
						setCurrentName(friend.name)
						return
					}
				})
				// if not found in state, then retreive data from firestore
				fetchProfileIMG(props.array.userID)
					.then((res) => {
						setCurrentPicture(res.img)
						setCurrentName(res.name)
					})
					.catch((e) => console.log("Loading data..."))
			}
		}

		return () => {
			ignore = true
		}
	}, [user, follows.friendInfo])

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

	function handleLike() {
		dispatch(
			addLikeToPost({
				myID: user.uid,
				userID: props.array.userID,
				message: props.array.body,
			})
		)
	}

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

	async function handleDeletePost() {
		dispatch(
			deleteMessage({
				userID: props.array.userID,
				message: props.array.body,
				image: props.array.image,
			})
		)
		setShowConfirmation(false)
	}

	// TODO: insert comments (https://mui.com/material-ui/react-card/)

	return (
		<>
			{/* Modal showing full picture */}
			<Modal
				size="lg"
				show={showPicture}
				onHide={() => setShowPicture(false)}
				aria-labelledby="full-picture-modal"
				centered
			>
				<Modal.Body>
					<div style={{ display: "grid", height: "100%" }}>
						<img
							src={props.array.image}
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
			{/* Modal showing deletion confirmation */}
			<Modal
				size="sm"
				show={showConfirmation}
				onHide={() => setShowConfirmation(false)}
				aria-labelledby="delete-post-confirmation-modal"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<WarningIcon color="warning" fontSize="large" />
						Are you sure you want to delete this post?
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>Once deleted, it's gone forever :(</Modal.Body>
				<Modal.Footer className="justify-content-evenly">
					<Button
						variant="contained"
						size="small"
						style={{ background: "red", color: "white" }}
						onClick={handleDeletePost}
					>
						Confirm
					</Button>
					<Button
						variant="contained"
						size="small"
						style={{ background: "#f2f2f2", color: "black" }}
						onClick={() => setShowConfirmation(false)}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			{follows && (
				<Card className="post--container" text="light">
					<h6
						className="post--container--header card-header w-100 d-flex"
						style={{ borderBottomWidth: 0 }}
						onClick={(e) =>
							handleUsernameClick(
								e,
								props.array.userHandle,
								props.array.userID
							)
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
								marginRight: "0.5em",
								cursor: "pointer",
								boxShadow: "0px 0px 0px 1px white",
							}}
							alt="user profile picture"
						></img>
						<div>
							<p style={{ cursor: "pointer" }}>
								<b className="mb-0">{currentName}</b>
								<span className="text-muted mb-0">
									(@{props.array.userHandle})
								</span>
							</p>
							<span className="text-muted">
								({formatRelativeDate(props.array.time * 1000)})
							</span>
						</div>
					</h6>
					<Card.Body
						style={{ backgroundColor: "var(--custom-card-body)" }}
					>
						{props.useCase === "self" && (
							<DeleteForeverIcon
								onClick={() => setShowConfirmation(true)}
								style={{
									position: "absolute",
									right: "1%",
									top: props.array.image ? "3%" : "7%",
									color: "var(--custom-card-text-colored)",
									cursor: "pointer",
								}}
							/>
						)}
						<Card.Title className="post--container--body">
							{props.array.body}
							{props.array.image && (
								<div
									style={{
										position: "relative",
										width: "100%",
										marginTop: props.array.body && "1rem",
									}}
									onClick={() => setShowPicture(true)}
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
										src={props.array.image}
										alt="post image"
									/>
								</div>
							)}
						</Card.Title>
					</Card.Body>
					<Card.Footer className="post--container--footer">
						<ThemeProvider theme={buttonTheme}>
							<Button
								className="post--container--button"
								variant="contained"
								size="small"
								color="neutral"
								sx={{
									backgroundColor:
										"var(--custom-card-header)",
									color: "#FF4C29",
									borderRadius: "2rem",
									textTransform: "capitalize",
									margin: "0 0.5rem",
								}}
								endIcon={<AddCommentIcon />}
							>
								<Link
									style={{
										color: "var(--custom-card-text)",
										textDecoration: "none",
									}}
									to="/comments"
									state={{ post: props.array }}
								>
									Comments
								</Link>
							</Button>
							<Button
								className="post--container--button"
								variant="contained"
								color="neutral"
								size="small"
								sx={
									props.array.likes &&
									props.array.likes.includes(user.uid)
										? {
												backgroundColor: "#F23030",
												color: "#334756",
												borderRadius: "2rem",
												margin: "0 0.5rem",
										  }
										: {
												backgroundColor:
													"var(--custom-card-header)",
												color: "#FF4C29",
												borderRadius: "2rem",
												margin: "0 0.5rem",
										  }
								}
								startIcon={<FavoriteIcon />}
								onClick={handleLike}
							>
								{Object(props.array.likes).length}
							</Button>
						</ThemeProvider>
					</Card.Footer>
				</Card>
			)}
		</>
	)
}

export default Message
