import React, { useEffect, useState } from "react"
import { Button, Stack } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { useDispatch } from "react-redux"
import { signout } from "./login/loginSlice"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useNavigate } from "react-router-dom"

function Header() {
	const [user, loading] = useAuthState(auth)
	const navigate = useNavigate()
	const [userHandle, setUserHandle] = useState("")
	const [userPicture, setUserPicture] = useState(null)
	const dispatch = useDispatch()

	useEffect(() => {
		let ignore = false
		if (!user && loading) return

		// load user handle on Header load based on user id
		const fetchHandle = async () => {
			const docUserInfo = doc(db, `user_info/${user.uid}`)
			const docInfo = await getDoc(docUserInfo)
			if (!ignore) {
				setUserHandle(docInfo.data().handle)
				setUserPicture(docInfo.data().profileIMG)
			}
		}

		fetchHandle().catch((e) =>
			console.log("Error fetching handle for header")
		)
		return () => {
			ignore = true
		}
	}, [])

	function handleUsernameClick() {
		navigate("/mypage")
	}

	function handleBackHome() {
		navigate("/")
	}

	return (
		<>
			<Stack direction="horizontal" className="dash--header w-100">
				<div
					style={{ display: "flex", alignItems: "center" }}
					onClick={handleBackHome}
				>
					<img
						className="header--image"
						src={require("../images/logo.png")}
					/>
					<h3 className="header--title" style={{ cursor: "pointer" }}>
						ReactSocial
					</h3>
				</div>
				<Stack direction="horizontal" gap={3}>
					{userHandle && userPicture && (
						<div
							className="d-flex align-items-center"
							style={{ gap: "0.5rem" }}
						>
							<img
								src={userPicture}
								style={{
									width: "2rem",
									height: "2rem",
									objectFit: "cover",
									borderRadius: "50%",
									marginRight: "0.5em",
									cursor: "pointer",
								}}
								onClick={handleUsernameClick}
							/>
							<h4
								className="mb-0"
								onClick={handleUsernameClick}
								style={{ cursor: "pointer", color: "#fff" }}
							>
								{userHandle}
							</h4>
						</div>
					)}
					{userHandle && <div className="vr" />}
					<Button
						className="dash--button"
						variant="outline-danger"
						onClick={() => dispatch(signout())}
					>
						Log Out
					</Button>
				</Stack>
			</Stack>
		</>
	)
}

export default Header
