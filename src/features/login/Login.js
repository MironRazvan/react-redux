import React, { useEffect, useRef, useState } from "react"
import { login, selectUser } from "./loginSlice"
import { Button, Form, Alert, Card, Container } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../../firebase/firebase"
import { useNavigate, Link } from "react-router-dom"
import { fetchFollowedAccounts, fetchFollowedPosts } from "../posts/postSlice"
import { fetchFollowsInfo } from "../follows/followsSlice"
import { selectPosts } from "../posts/postSlice"

function Login() {
	const email = useRef()
	const password = useRef()
	const [err, setErr] = useState("")
	const navigate = useNavigate()
	const isLoggedIn = useSelector(selectUser)
	const [currentUser, loading] = useAuthState(auth)
	const dispatch = useDispatch()
	const posts = useSelector(selectPosts)

	useEffect(() => {
		if (currentUser && !loading) {
			dispatch(fetchFollowedAccounts(currentUser.uid))
			dispatch(fetchFollowedPosts(currentUser.uid))
			dispatch(fetchFollowsInfo(posts.follows))
			navigate("/")
			return
		}
	}, [isLoggedIn, currentUser, loading])

	function handleSubmit(event) {
		event.preventDefault()

		if (!password.current.value) {
			setErr("Please type in your password")
			return
		}
		// setErr("")
		dispatch(
			login({
				email: email.current.value,
				password: password.current.value,
			})
		)
	}
	return (
		<>
			<Container
				className="d-flex flex-column align-items-center justify-content-center"
				style={{ minHeight: "100vh" }}
			>
				<Card className="login--container">
					<Card.Body>
						<h2 className="text-center mb-4">Login</h2>
						{err && <Alert variant="danger">{err}</Alert>}
						{isLoggedIn.error !== "" && (
							<Alert variant="danger">{isLoggedIn.error}</Alert>
						)}
						<Form onSubmit={handleSubmit}>
							<Form.Group id="email">
								<Form.Label>Email</Form.Label>
								<Form.Control type="email" ref={email} />
							</Form.Group>
							<Form.Group id="password">
								<Form.Label>Password</Form.Label>
								<Form.Control type="password" ref={password} />
							</Form.Group>
							<Button
								className="w-100 mt-4"
								type="submit"
								variant="primary"
							>
								Log In
							</Button>
						</Form>
					</Card.Body>
				</Card>
				<div
					className="w-100 text-center mt-2"
					style={{ color: "white" }}
				>
					Don't have an account?{" "}
					<Link to="/register">Create An Account</Link>
				</div>
			</Container>
			{/* <Footer /> */}
		</>
	)
}

export default Login
