import React, { useEffect, useState } from "react"
import { Card, Modal } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { useDispatch } from "react-redux"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Fab from "@mui/material/Fab"
import AddCommentIcon from "@mui/icons-material/AddComment"
import FavoriteIcon from "@mui/icons-material/Favorite"
import { addLikeToPost } from "./posts/postSlice"
import { useNavigate } from "react-router-dom"

function Message(props) {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [showPicture, setShowPicture] = useState(false)
	const [user] = useAuthState(auth)
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

	function handleLike() {
		dispatch(
			addLikeToPost({
				myID: user.uid,
				userID: props.array.userID,
				message: props.array.body,
			})
		)
	}

	function handleUserSearchClick(event, username, userID) {
		event.preventDefault()
		if (userID === user.uid) {
			navigate("/mypage")
			return
		}
		navigate("/userpage", {
			state: { username: username, userID: userID },
		})
	}

	// TODO: insert comments (https://mui.com/material-ui/react-card/)

	// useEffect(() => {}, [])

	return (
		<>
			<Modal
				size="lg"
				show={showPicture}
				onHide={() => setShowPicture(false)}
				aria-labelledby="example-modal-sizes-title-lg"
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
			<Card className="post--container" text="light">
				<h6
					className="post--container--header card-header w-100 d-flex"
					style={{ borderBottomWidth: 0 }}
				>
					<p
						className="mb-0"
						onClick={(e) =>
							handleUserSearchClick(
								e,
								props.array.userHandle,
								props.array.userID
							)
						}
						style={{ cursor: "pointer" }}
					>
						{props.array.userHandle}
						<span className="text-muted">
							({formatRelativeDate(props.array.time * 1000)})
						</span>
					</p>

					{/* </Stack> */}
				</h6>
				<Card.Body
					style={{ backgroundColor: "var(--custom-card-body)" }}
				>
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
						style={{ backgroundColor: "#334756", color: "#FF4C29" }}
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
		</>
	)
}

export default Message
