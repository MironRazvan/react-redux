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
import { fetchFollowedPosts } from "./posts/postSlice"
import { fetchFollowsInfo, selectFollows } from "./follows/followsSlice"

function Dash() {
	const [user, loading] = useAuthState(auth)
	const dispatch = useDispatch()
	const isLoggedIn = useSelector(selectUser)
	const posts = useSelector(selectPosts)
	const follows = useSelector(selectFollows)
	const navigate = useNavigate()

	useEffect(() => {
		if (!loading) {
			if (!user || !isLoggedIn.isSet) {
				navigate("/login")
				return
			}
		}
	}, [user])

	useEffect(() => {
		if (user) {
			dispatch(fetchFollowedPosts(user.uid))
			// dispatch(fetchFollowsInfo(posts.follows))
		}
	}, [posts.posts.length, follows.friendInfo.length, user])

	function handleUserSearchClick(event, username, userID) {
		event.preventDefault()
		if (userID === user.uid) {
			navigate("/mypage")
			return
		}
		navigate("/userpage", {
			state: { username: username, userID: userID, useCase: "self" },
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
