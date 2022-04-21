import React, { useEffect, useState } from "react"
import { Spinner, Card, Modal, Accordion } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/firebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import Footer from "./Footer"
import Header from "./Header"

function MyPage() {
	const navigate = useNavigate()
	const [user, loading] = useAuthState(auth)
	const [currentUserInfo, setCurrentUserInfo] = useState([])
	const [show, setShow] = useState(false)

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
					if (!ignore) setCurrentUserInfo(info)
				}
				fetchUserInfo().catch((e) => console.log("Loading data"))
				window.scrollTo(0, 0)
			}
		}

		return () => {
			ignore = true
		}
	}, [user, loading])

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
					<Accordion flush>
						<Accordion.Item eventKey="0">
							<Accordion.Header>
								Search for users...
							</Accordion.Header>
							<Accordion.Body>
								<input></input>
								<button>Click me</button>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
					<Footer />
				</>
			)}
		</>
	)
}

export default MyPage
