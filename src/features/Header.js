import React, { useEffect, useState } from "react"
import { Button, Stack } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { useDispatch, useSelector } from "react-redux"
import { signout } from "./login/loginSlice"
import { useNavigate } from "react-router-dom"
import { selectFollows } from "../features/follows/followsSlice"
import { fetchMyPosts, selectPosts } from "./posts/postSlice"
import { fetchFollowsInfo } from "./follows/followsSlice"

function Header() {
	const [user, loading] = useAuthState(auth)
	const navigate = useNavigate()
	const [userHandle, setUserHandle] = useState("")
	const [userPicture, setUserPicture] = useState(null)
	const dispatch = useDispatch()
	const follows = useSelector(selectFollows)
	const posts = useSelector(selectPosts)

	useEffect(() => {
		let ignore = false
		if (!user && loading) return

		follows.friendInfo.forEach((friend) => {
			if (friend.userID === user.uid) {
				if (!ignore) {
					setUserHandle(friend.name.split(" ")[0])
					setUserPicture(friend.profileIMG)
				}
			}
		})

		return () => {
			ignore = true
		}
	}, [user, loading, follows.friendInfo.length])

	function handleUsernameClick() {
		dispatch(fetchMyPosts(user.uid))
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
						alt="app logo"
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
									boxShadow: "0px 0px 0px 1px white",
								}}
								onClick={handleUsernameClick}
								alt="user profile"
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
