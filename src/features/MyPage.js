import React, { useEffect, useState } from "react"
import { Spinner, Card, Modal } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/firebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import Footer from "./Footer"
import Header from "./Header"
import Posts from "./posts/Posts"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyPosts, selectPosts } from "./posts/postSlice"
import PostMessage from "./PostMessage"

function MyPage() {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const posts = useSelector(selectPosts)
	const [user, loading] = useAuthState(auth)
	const [currentUserInfo, setCurrentUserInfo] = useState([])
	const [show, setShow] = useState(false)

	useEffect(() => {}, [])

	useEffect(() => {
		let ignore = false

		if (!loading) {
			if (!user) {
				navigate("/login")
				return
			} else {
				// console.log(auth.currentUser)
				async function fetchUserInfo() {
					// gets current user info
					const docUserInfo = doc(db, `user_info/${user.uid}`)
					const docInfo = await getDoc(docUserInfo)
					const info = docInfo.data()

					// set friend list in state
					if (!ignore) {
						setCurrentUserInfo(info)
						dispatch(fetchMyPosts(user.uid))
					}
				}
				fetchUserInfo().catch((e) => console.log("Loading data"))
				window.scrollTo(0, 0)
			}
		}

		return () => {
			ignore = true
		}
	}, [user, loading, posts.posts.length])

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
					<Card className="myinfo--container">
						<Card.Body className="myinfo--body">
							<Card.Title className="myinfo--title">
								<img
									src="https://www.fillmurray.com/1280/720"
									onClick={() => setShow(true)}
								/>
								<br></br>
								<h6>
									{currentUserInfo.name}{" "}
									<i>(@{currentUserInfo.handle})</i>
								</h6>
							</Card.Title>
							<Card.Body className="myinfo--info">
								<div className="d-flex align-items-center">
									<p style={{ margin: "0" }}>
										<LocationOnIcon fontSize="small" />
										<strong>
											{currentUserInfo.location}
										</strong>
									</p>
									<div className="vr mx-3" />
									<p style={{ margin: "0" }}>
										<strong>{currentUserInfo.age}</strong>
									</p>
								</div>
							</Card.Body>
						</Card.Body>
					</Card>
					<hr
						style={{
							borderTop: "2px solid #F23030",
						}}
					/>
					<PostMessage />
					<hr
						style={{
							borderTop: "2px solid #F23030",
						}}
					/>
					<Posts useCase="self" />
					<Footer />
				</>
			)}
		</>
	)
}

export default MyPage
