import React, { useEffect, useState } from "react"
import { Button, Card, Modal } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/firebase"
import { useDispatch, useSelector } from "react-redux"
import Fab from "@mui/material/Fab"
import AddCommentIcon from "@mui/icons-material/AddComment"
import FavoriteIcon from "@mui/icons-material/Favorite"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { addLikeToPost, deleteMessage } from "./posts/postSlice"
import { useNavigate } from "react-router-dom"
import "react-confirm-alert/src/react-confirm-alert.css"
import WarningIcon from "@mui/icons-material/Warning"
import { selectFollows } from "./follows/followsSlice"

function Message(props) {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [showPicture, setShowPicture] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [currentPicture, setCurrentPicture] = useState("")
	const [user] = useAuthState(auth)
	const follows = useSelector(selectFollows)

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
		if (!follows.loading) {
			if (!ignore) {
				setCurrentPicture(
					follows.friendInfo.find(
						(friend) => friend.userID === props.array.userID
					).profileIMG
				)
			}
		}
		return () => {
			ignore = true
		}
	}, [follows.friendInfo])

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
					<Button variant="danger" onClick={handleDeletePost}>
						Confirm
					</Button>
					<Button
						variant="secondary"
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
						{!follows.loading && (
							<img
								src={currentPicture}
								style={{
									width: "2rem",
									height: "2rem",
									objectFit: "cover",
									borderRadius: "50%",
									marginRight: "0.5em",
									cursor: "pointer",
								}}
							></img>
						)}
						<p className="mb-0" style={{ cursor: "pointer" }}>
							{props.array.userHandle}
							<span className="text-muted">
								({formatRelativeDate(props.array.time * 1000)})
							</span>
						</p>
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
									top: props.array.image ? "1%" : "3%",
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
									/>
								</div>
							)}
						</Card.Title>
					</Card.Body>
					<Card.Footer className="post--container--footer">
						<Fab
							className="post--container--button"
							variant="extended"
							size="small"
							style={{
								backgroundColor: "#334756",
								color: "#FF4C29",
							}}
						>
							Comment
							<AddCommentIcon sx={{ mx: 1 }} />
						</Fab>
						<Fab
							className="post--container--button"
							variant="extended"
							size="small"
							style={
								props.array.likes &&
								props.array.likes.includes(user.uid)
									? {
											backgroundColor: "#F23030",
											color: "#334756",
									  }
									: {
											backgroundColor: "#334756",
											color: "#FF4C29",
									  }
							}
							// style={{ backgroundColor: "#F23030", color: "#334756" }}
							onClick={handleLike}
						>
							<FavoriteIcon sx={{ mr: 1 }} />
							{Object(props.array.likes).length}
						</Fab>
					</Card.Footer>
				</Card>
			)}
		</>
	)
}

export default Message
