import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { selectUser } from "./login/loginSlice"
import { useNavigate } from "react-router-dom"
import { Spinner } from "react-bootstrap"
import Posts from "./posts/Posts"
import Footer from "./Footer"
import Header from "./Header"
import PostMessage from "./PostMessage"
import SearchUser from "./SearchUser"
import { selectPosts } from "./posts/postSlice"
import { fetchFollowedAccounts, fetchFollowedPosts } from "./posts/postSlice"
import { fetchFollowsInfo } from "./follows/followsSlice"

function Dash() {
	const [user, loading] = useAuthState(auth)
	const dispatch = useDispatch()
	const isLoggedIn = useSelector(selectUser)
	const posts = useSelector(selectPosts)
	const navigate = useNavigate()

	useEffect(() => {
		if (!loading) {
			if (!user || !isLoggedIn.isSet) {
				navigate("/login")
				return
			} else {
				dispatch(fetchFollowedAccounts(user.uid))
				dispatch(fetchFollowedPosts(user.uid))
				dispatch(fetchFollowsInfo(posts.follows))
			}
		}
		return
	}, [user])

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

	return (
		<>
			{!user ? (
				<div className="spinner--container">
					<Spinner animation="border" variant="info" />
				</div>
			) : (
				<>
					<Header />
					<PostMessage />
					<hr
						style={{
							borderTop: "2px solid #F23030",
						}}
					/>
					<div>
						<div className="dash--search" bg="dark">
							<SearchUser handleClick={handleUserSearchClick} />
						</div>
						<Posts useCase="feed" />
					</div>
					<Footer />
				</>
			)}
		</>
	)
}

export default Dash
