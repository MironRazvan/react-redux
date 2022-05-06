import React, { useEffect, useRef, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
	Button,
	Form,
	Alert,
	Card,
	Container,
	InputGroup,
} from "react-bootstrap"
import { auth, db, storage } from "../../firebase/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import Footer from "../Footer"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import {
	query,
	collection,
	where,
	getDocs,
	setDoc,
	doc,
} from "firebase/firestore"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyPosts, handleNewAccount, selectPosts } from "../posts/postSlice"
import { fetchFollowedAccounts, fetchFollowedPosts } from "../posts/postSlice"
import {
	fetchFollowsInfo,
	selectFollows,
	handleNewAcountInfo,
} from "../follows/followsSlice"
import { loginAfterRegistration } from "../login/loginSlice"
import { register } from "../login/loginSlice"
import { async } from "@firebase/util"

export default function Register() {
	const email = useRef()
	const password = useRef()
	const passwordRepeat = useRef()
	const name = useRef()
	const age = useRef()
	const handle = useRef()
	const location = useRef()
	const image = useRef()

	const dispatch = useDispatch()
	const posts = useSelector(selectPosts)
	const follow = useSelector(selectFollows)

	const navigate = useNavigate()

	const [imageLink, setImageLink] = useState("")
	const [err, setErr] = useState("")
	const [flag, setFlag] = useState(false)
	// const navigate = useNavigate()
	const [user, loading] = useAuthState(auth)
	const [userInputs, setUserInputs] = useState({
		email: "",
		password: "",
		passwordRepeat: "",
		name: "",
		handle: "",
		follows: [],
		age: 0,
		location: "",
		image: "",
		userID: "",
	})

	useEffect(() => {
		if (!user) return

		const getData = async () => {
			await fetchImageURLFromFirebase(userInputs.image)
		}

		const setData = async () => {
			await setDoc(doc(db, "user_info", `${userInputs.userID}`), {
				name: pascalCase(userInputs.name),
				email: userInputs.email,
				handle: userInputs.handle,
				handle_lowercase: userInputs.handle.toLowerCase(),
				follows: [userInputs.userID],
				age: parseInt(userInputs.age),
				location: pascalCase(userInputs.location),
				userID: userInputs.userID,
				profileIMG: userInputs.image,
			})
		}

		const dispatchAll = async () => {
			dispatch(handleNewAccount(userInputs.userID))
			dispatch(
				handleNewAcountInfo({
					name: pascalCase(userInputs.name),
					email: userInputs.email,
					handle: userInputs.handle,
					handle_lowercase: userInputs.handle.toLowerCase(),
					follows: [userInputs.userID],
					age: parseInt(userInputs.age),
					location: pascalCase(userInputs.location),
					userID: userInputs.userID,
					profileIMG: userInputs.image,
				})
			)
			setFlag(true)
		}

		if (!imageLink) {
			getData()
			return
		}

		if (userInputs.userID && !flag) {
			setData()
			dispatchAll()
			return
		}
		navigate("/")

		if (follow.friendInfo[0].handle && follow.friendInfo[0].handle !== "") {
			console.log(posts)
			console.log("----------------------")
			console.log(follow.friendInfo)
			console.log("----------------------")
			// return
		}
	}, [user, imageLink, follow.friendInfo[0]])

	function pascalCase(str) {
		return str.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
			return g1.toUpperCase() + g2.toLowerCase()
		})
	}

	// uploads userProfileImage to Firebase Storage and returns an URL
	async function fetchImageURLFromFirebase(userImage) {
		const fileName = user.uid + "_PROFILE"
		const uploadRef = ref(storage, `users_uploads/${user.uid}/${fileName}`)
		let customURL = ""
		await uploadBytes(uploadRef, userImage).then(async (result) => {
			await getDownloadURL(result.ref).then((url) => {
				customURL = url
			})
		})
		setImageLink(customURL)
		setUserInputs((prevInputs) => {
			return {
				...prevInputs,
				follows: [...prevInputs.follows, user.uid],
				image: customURL,
				userID: user.uid,
			}
		})
		return customURL
	}

	// updates state on user input change
	function handleChange(event) {
		const { name, value } = event.target
		setUserInputs((prevInputs) => {
			return {
				...prevInputs,
				[name]: name === "image" ? event.target.files[0] : value,
			}
		})
	}

	// checks if handle is available
	async function checkHandle(chosenHandle) {
		const q = query(
			collection(db, "user_info"),
			where("handle", "==", chosenHandle)
		)
		const qSnap = await getDocs(q)
		return qSnap.size
	}

	// checks if email is available
	async function checkEmail(chosenEmail) {
		const q = query(
			collection(db, "user_info"),
			where("email", "==", chosenEmail)
		)
		const qSnap = await getDocs(q)
		return qSnap.size
	}

	async function handleSubmit(event) {
		event.preventDefault()

		if (password.current.value !== passwordRepeat.current.value) {
			setErr("Passwords do no match")
			return
		}
		if (age.current.value < 14) {
			setErr("You're too young")
			return
		}
		if ((await checkHandle(handle.current.value)) > 0) {
			setErr("Handle already taken :(")
			return
		}
		if ((await checkEmail(email.current.value)) > 0) {
			setErr("Email is already in use")
			return
		}
		if (!image.current.files[0]) {
			setErr(
				"You have not chose a profile picture",
				"(you can change it later)"
			)
			return
		}

		try {
			setErr("")
			dispatch(
				register({
					email: email.current.value,
					password: password.current.value,
				})
			)
		} catch (e) {
			setErr("Unable to Register New Account")
		}
	}

	return (
		<>
			<Container
				className="d-flex flex-column align-items-center justify-content-center"
				style={{ minHeight: "100vh" }}
			>
				<Card className="login--container">
					<Card.Body>
						<h2 className="text-center mb-4">Register</h2>
						{err && <Alert variant="danger">{err}</Alert>}
						<Form onSubmit={handleSubmit}>
							<Form.Group id="email">
								<Form.Label className="mb-0 mt-2">
									Email
								</Form.Label>
								<Form.Control
									type="email"
									name="email"
									ref={email}
									onChange={handleChange}
									size="sm"
									required
								/>
							</Form.Group>
							<Form.Group id="password">
								<Form.Label className="mb-0 mt-2">
									Password
								</Form.Label>
								<Form.Control
									type="password"
									ref={password}
									name="password"
									onChange={handleChange}
									size="sm"
									required
								/>
							</Form.Group>
							<Form.Group id="passwordCheck">
								<Form.Label className="mb-0 mt-2">
									Password Check
								</Form.Label>
								<Form.Control
									type="password"
									ref={passwordRepeat}
									name="passwordRepeat"
									onChange={handleChange}
									size="sm"
									required
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label className="mb-0 mt-2">
									Full name
								</Form.Label>
								<Form.Control
									ref={name}
									name="name"
									type="text"
									onChange={handleChange}
									size="sm"
									required
								/>
							</Form.Group>
							<div className="row">
								<Form.Group className="col-6">
									<Form.Label className="mb-0 mt-2">
										Handle
									</Form.Label>
									<InputGroup size="sm">
										<InputGroup.Text>@</InputGroup.Text>
										<Form.Control
											ref={handle}
											name="handle"
											onChange={handleChange}
											required
										/>
									</InputGroup>
								</Form.Group>
								<Form.Group className="col-6">
									<Form.Label className="mb-0 mt-2">
										Age
									</Form.Label>
									<Form.Control
										ref={age}
										name="age"
										type="number"
										onChange={handleChange}
										size="sm"
										required
									/>
								</Form.Group>
							</div>
							<Form.Group>
								<Form.Label className="mb-0 mt-2">
									Location
								</Form.Label>
								<Form.Control
									ref={location}
									name="location"
									onChange={handleChange}
									size="sm"
									required
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label className="mb-0 mt-2">
									Profile Picture
								</Form.Label>
								<Form.Control
									ref={image}
									name="image"
									accept="image/*"
									onChange={handleChange}
									type="file"
									size="sm"
									required
								/>
							</Form.Group>
							<Button
								className="w-100 mt-4"
								type="submit"
								variant="primary"
							>
								Create Account
							</Button>
						</Form>
					</Card.Body>
				</Card>
				<div
					className="w-100 text-center mt-2"
					style={{ color: "white" }}
				>
					Already have an account? <Link to="/login">Log In</Link>
				</div>
			</Container>
			<Footer />
		</>
	)
}
