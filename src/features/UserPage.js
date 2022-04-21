import React, { useEffect, useState } from "react"
import { Card, Modal } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import Footer from "./Footer"
import Header from "./Header"
import Posts from "./posts/Posts"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { fetchMyPosts, handleFollowState, selectPosts } from "./posts/postSlice"
import { auth } from "../firebase/firebase"
import { Spinner } from "react-bootstrap"
import { Fab } from "@mui/material"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import PersonRemoveIcon from "@mui/icons-material/PersonRemove"

function UserPage(props) {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()
	const posts = useSelector(selectPosts)
	const [user, loading] = useAuthState(auth)
	const [currentUserInfo, setCurrentUserInfo] = useState([])
	const [show, setShow] = useState(false)

	useEffect(() => {
		let ignore = false
		if (!user && !loading) {
			navigate("/login")
			return
		} else {
			async function fetchUserInfo() {
				// gets current user info
				const docUserInfo = doc(
					db,
					`user_info/${location.state.userID}`
				)
				const docInfo = await getDoc(docUserInfo)
				const info = docInfo.data()

				// set friend list in state
				if (!ignore) setCurrentUserInfo(info)
			}
			fetchUserInfo().catch((e) => console.log("Loading data"))
			dispatch(fetchMyPosts(location.state.userID))
			window.scrollTo(0, 0)
		}
		return () => {
			ignore = true
		}
	}, [posts.posts.length, posts.follows, user])

	// TODO: fix firestore database (some users info is fucked up as in ID doesn't match)

	return (
		<>
			{!user ? (
				<div className="spinner--container">
					<Spinner animation="border" variant="info" />
				</div>
			) : (
				<>
					<Header />
					<Modal
						size="lg"
						show={show}
						onHide={() => setShow(false)}
						aria-labelledby="example-modal-sizes-title-lg"
					>
						<Modal.Body>
							<div style={{ display: "grid", height: "100%" }}>
								<img
									src="https://www.fillmurray.com/1280/720"
									style={{
										maxWidth: "100%",
										maxHeight: "100vh",
										margin: "auto",
									}}
								/>
							</div>
						</Modal.Body>
					</Modal>
					<Card
						style={{
							maxWidth: "90%",
							left: "5%",
							margin: "3% 0",
						}}
					>
						<Card.Body>
							<Card.Title
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
									}}
								>
									<h6>
										{currentUserInfo.name}{" "}
										<small>
											<i>(@{currentUserInfo.handle})</i>
										</small>
									</h6>
									<img
										src="https://www.fillmurray.com/1280/720"
										onClick={() => setShow(true)}
										style={{
											width: "60px",
											height: "60px",
											objectFit: "cover",
											borderRadius: "50%",
										}}
									/>
								</div>
								<Fab
									variant="extended"
									size="medium"
									color={
										!posts.follows.includes(
											location.state.userID
										)
											? "primary"
											: "error"
									}
									style={{
										textTransform: "none",
										padding: "2em 0.5em",
									}}
									onClick={() =>
										dispatch(
											handleFollowState({
												myID: user.uid,
												userID: location.state.userID,
												followState:
													posts.follows.includes(
														location.state.userID
													),
											})
										)
									}
								>
									{!posts.follows.includes(
										location.state.userID
									) ? (
										<div>
											<PersonAddAlt1Icon sx={{ mr: 1 }} />{" "}
											Follow
										</div>
									) : (
										<div>
											<PersonRemoveIcon sx={{ mr: 1 }} />{" "}
											Unfollow
										</div>
									)}
								</Fab>
							</Card.Title>
							<Card.Body
								style={{
									display: "flex",
									justifyContent: "space-between",
								}}
							>
								<p style={{ marginBottom: "0" }}>
									Age: <strong>{currentUserInfo.age}</strong>
								</p>
								<p style={{ marginBottom: "0" }}>
									Location:{" "}
									<strong>{currentUserInfo.location}</strong>
								</p>
							</Card.Body>
						</Card.Body>
					</Card>
					<Posts />
					<Footer />
				</>
			)}
		</>
	)
}

export default UserPage
