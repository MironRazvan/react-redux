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
import LocationOnIcon from "@mui/icons-material/LocationOn"

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

	return (
		<>
			{!user || !currentUserInfo ? (
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
									src={currentUserInfo.profileIMG}
									style={{
										maxWidth: "100%",
										maxHeight: "100vh",
										margin: "auto",
									}}
								/>
							</div>
						</Modal.Body>
					</Modal>
					<Card className="userinfo--container">
						<Card.Body className="userinfo--body">
							<Card.Title className="userinfo--title">
								<img
									src={currentUserInfo.profileIMG}
									onClick={() => setShow(true)}
								/>
								<br></br>
								<h6>
									{currentUserInfo.name}{" "}
									<i>(@{currentUserInfo.handle})</i>
								</h6>
							</Card.Title>
							<Card.Body
								className="userinfo--info"
								style={{
									display: "flex",
									alignItems: "center",
									flexDirection: "column",
								}}
							>
								<div className="d-flex align-items-center mb-3">
									<p style={{ marginBottom: "0" }}>
										<LocationOnIcon fontSize="small" />
										<strong>
											{currentUserInfo.location}
										</strong>
									</p>
									<div className="vr mx-3" />
									<p style={{ marginBottom: "0" }}>
										<strong>{currentUserInfo.age}</strong>
									</p>
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
										padding: "0 0.5em",
										width: "100%",
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
