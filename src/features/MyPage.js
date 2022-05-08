import React, { useEffect, useState, useRef } from "react"
import {
	Spinner,
	Card,
	Modal,
	OverlayTrigger,
	Tooltip,
	Form,
	FloatingLabel,
	Alert,
} from "react-bootstrap"
import { Button } from "@mui/material"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { auth, db, storage } from "../firebase/firebase"
import {
	deleteObject,
	getDownloadURL,
	listAll,
	ref,
	uploadBytes,
} from "firebase/storage"
import {
	doc,
	updateDoc,
	query,
	collection,
	where,
	getDocs,
	deleteDoc,
	getDoc,
	arrayRemove,
} from "firebase/firestore"
import Footer from "./Footer"
import Header from "./Header"
import Posts from "./posts/Posts"
import PostMessage from "./PostMessage"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import EditIcon from "@mui/icons-material/Edit"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyPosts, handleNewAccount, selectPosts } from "./posts/postSlice"
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import {
	selectFollows,
	updateIMG,
	updateName,
	updateAge,
	updateLocation,
	updateAbout,
	handleNewAcountInfo,
} from "./follows/followsSlice"
import {
	reauthenticateWithCredential,
	EmailAuthProvider,
	deleteUser,
} from "firebase/auth"
import { validate } from "react-email-validator"
import { updateEmail, updatePassword } from "firebase/auth"
import { signout } from "./login/loginSlice"

function MyPage() {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const email = useRef()
	const emailUpdate = useRef()
	const password = useRef()
	const passwordUpdate = useRef()
	const passwordConfirm = useRef()
	const passwordConfirmUpdate = useRef()
	const name = useRef()
	const age = useRef()
	const location = useRef()
	const about = useRef()
	const [userImage, setUserImage] = useState(null)

	const posts = useSelector(selectPosts)
	const follows = useSelector(selectFollows)
	const [user, loading] = useAuthState(auth)
	const [currentProfilePicture, setCurrentProfilePicture] = useState("")
	const [currentUserInfo, setCurrentUserInfo] = useState([])
	const [showPictureModal, setShowPictureModal] = useState(false)
	const [showUpdateInfoModal, setShowUpdateInfoModal] = useState(false)
	const [showUpdateAccount, setShowUpdateAccount] = useState(false)
	const [showReauthenticate, setShowReauthenticate] = useState(false)
	const [isReAuth, setIsReAuth] = useState(false)
	const [updateField, setUpdateField] = useState("")
	const [err, setErr] = useState("")
	const [updateError, setUpdateError] = useState("")

	const showEditTooltip = (props) => {
		return <Tooltip {...props}>Edit profile details</Tooltip>
	}

	const showAccountTooltip = (props) => {
		return <Tooltip {...props}>Edit account details</Tooltip>
	}

	function pascalCase(str) {
		return str.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
			return g1.toUpperCase() + g2.toLowerCase()
		})
	}

	function handleImageChange(event) {
		event.preventDefault()

		let reader = new FileReader()
		reader.readAsDataURL(event.target.files[0])
		reader.onload = (ev) => {
			setCurrentProfilePicture(ev.target.result)
		}
		setUserImage(event.target.files[0])
	}

	function handleFormCancel() {
		setShowUpdateInfoModal(false)
		setShowUpdateAccount(false)
		setShowReauthenticate(false)
		setIsReAuth(false)
		setUpdateField("")
		setErr("")
		setUpdateError("")
		setCurrentProfilePicture(currentUserInfo.profileIMG)
		setUserImage(null)
	}

	function handleFormSubmit() {
		updateUserProfile({
			name: name && name.current.value,
			age: age && age.current.value,
			location: location && location.current.value,
			about: about && about.current.value,
			profileIMG: currentProfilePicture && userImage,
		})
		handleFormCancel()
	}

	async function updateUserProfile({
		name,
		age,
		location,
		about,
		profileIMG,
	}) {
		// create ref to firestore doc
		const userRef = doc(db, "user_info", `${user.uid}`)

		if (profileIMG) {
			// if the user wishes to update the profile picture then update user_info
			const imgURL = await fetchImageURLFromFirebase()

			await updateDoc(userRef, {
				profileIMG: `${imgURL}`,
			})
			// update redux state and firebase storage (userImage on posts is fetched from there)
			// const storageRef = ref(
			// 	storage,
			// 	`users_uploads/${user.uid}/${user.uid}_PROFILE`
			// )
			dispatch(updateIMG({ img: imgURL, userID: user.uid }))
		}
		if (name) {
			await updateDoc(userRef, {
				name: pascalCase(name),
			})
			dispatch(updateName({ name: pascalCase(name), userID: user.uid }))
		}
		if (age) {
			await updateDoc(userRef, {
				age: parseInt(age),
			})
			dispatch(updateAge({ age: parseInt(age), userID: user.uid }))
		}
		if (location) {
			await updateDoc(userRef, {
				location: pascalCase(location),
			})
			dispatch(
				updateLocation({
					location: pascalCase(location),
					userID: user.uid,
				})
			)
		}
		if (about) {
			await updateDoc(userRef, {
				about: about,
			})
			dispatch(updateAbout({ about: about, userID: user.uid }))
		}
	}

	// uploads image to firebase storage and retrieves a url
	async function fetchImageURLFromFirebase() {
		const fileName = user.uid + "_PROFILE"
		const uploadRef = ref(storage, `users_uploads/${user.uid}/${fileName}`)
		let customURL = ""
		await uploadBytes(uploadRef, userImage).then(async (result) => {
			await getDownloadURL(result.ref).then((url) => {
				customURL = url
			})
		})
		return customURL
	}

	function handleEmailChange() {
		setShowUpdateAccount(false)
		setShowReauthenticate(true)
		setUpdateField("email")
	}

	function handlePasswordChange() {
		setShowReauthenticate(true)
		setShowUpdateAccount(false)
		setUpdateField("password")
	}

	function handleAccountDelete() {
		setShowReauthenticate(true)
		setShowUpdateAccount(false)
		setUpdateField("account")
	}

	function checkAuthCredentials() {
		if (!email.current.value || !password.current.value) return

		const credential = EmailAuthProvider.credential(
			email.current.value,
			password.current.value
		)
		reauthenticateWithCredential(user, credential)
			.then(() => {
				setIsReAuth(true)
				setShowReauthenticate(false)
			})
			.catch((e) => {
				console.log(e.message)
				setErr(e.message)
			})
	}

	async function handleDelete() {
		// dispatch function for redux (avoids errors with missing data)
		dispatch(handleNewAccount([]))
		dispatch(
			handleNewAcountInfo({
				handle: "",
				profileIMG: "",
			})
		)

		// delete messages from user_posts
		const q = query(
			collection(db, "user_posts"),
			where("userID", "==", `${user.uid}`)
		)
		const qSnap = await getDocs(q)
		qSnap.forEach(async (post) => {
			await deleteDoc(doc(db, "user_posts", post.id))
		})

		// delete user from user_info follows
		const q2 = query(
			collection(db, "user_info"),
			where("follows", "array-contains", `${user.uid}`)
		)
		const qSnap2 = await getDocs(q2)
		qSnap2.forEach(async (userInfo) => {
			if (userInfo.data().follows.length > 1) {
				// then userInfo follows current account and we must remove it
				const postRef = doc(db, "user_info", `${userInfo.id}`)
				await updateDoc(postRef, {
					follows: arrayRemove(`${user.uid}`),
				})
			} else {
				// if there's only one follower it means userInfo is ourself
				await deleteDoc(doc(db, "user_info", `${user.uid}`))
			}
		})

		// delete all user images from storage
		// firebase storage doesn't allow you to delete folders
		// the only solution i could find was to iterate through all pictures and delete them one by one
		const listRef = ref(storage, `users_uploads/${user.uid}`)
		listAll(listRef)
			.then((res) => {
				res.items.forEach(async (image) => {
					await deleteObject(image).catch((e) => console.log(e))
				})
			})
			.catch((e) => console.log(e))
	}

	async function handleAccountUpdate() {
		setUpdateError("")
		switch (updateField) {
			case "email":
				if (!validate(emailUpdate.current.value)) {
					setUpdateError("Error: Not a valid email!")
					return
				}
				setUpdateError("")
				updateEmail(user, emailUpdate.current.value)
					.then(() => dispatch(signout()))
					.catch((e) => {
						let myErr = pascalCase(
							e.customData._tokenResponse.error.message
						)
						let customError = myErr.split("_")
						setUpdateError("Error:")
						for (const word in customError) {
							setUpdateError((prevError) =>
								prevError.concat(" " + customError[word])
							)
						}
					})
				return
			case "password":
				if (
					passwordUpdate.current.value !==
					passwordConfirmUpdate.current.value
				) {
					setUpdateError("Passwords do no match!")
					return
				}
				updatePassword(user, passwordUpdate.current.value)
					.then(() => dispatch(signout()))
					.catch((e) => {
						setUpdateError("Password not strong enough")
						return
					})
				return
			case "account":
				handleDelete()
					.then(() => {
						navigate("/login")
						deleteUser(user).catch((e) => console.log(e))
						return
					})
					.catch((e) => console.log(e))
				return
			default:
				return
		}
	}

	useEffect(() => {
		let ignore = false

		if (!loading) {
			if (!user) {
				navigate("/login")
				return
			} else {
				follows.friendInfo.forEach((friend) => {
					if (friend.userID === user.uid) {
						if (!ignore) {
							setCurrentUserInfo(friend)
							setCurrentProfilePicture(friend.profileIMG)
						}
					}
				})
				window.scrollTo(0, 0)
			}
		}

		return () => {
			ignore = true
		}
	}, [user, loading, follows])

	useEffect(() => {
		if (user) {
			dispatch(fetchMyPosts(user.uid))
		}
	}, [posts.posts.length])

	return (
		<>
			{!user || !currentUserInfo ? (
				<div className="spinner--container">
					<Spinner animation="border" variant="info" />
				</div>
			) : (
				<>
					<Header />

					{/* modal for showing large picture */}
					<Modal
						size="lg"
						show={showPictureModal}
						onHide={() => setShowPictureModal(false)}
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
									alt="full post body"
								/>
							</div>
						</Modal.Body>
					</Modal>

					{/* modal for reauthenticating */}
					<Modal
						size="sm"
						show={showReauthenticate}
						onHide={handleFormCancel}
						centered
					>
						<Modal.Header closeButton>
							<Modal.Title>
								Please insert your login details
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form>
								<Form.Group className="mb-2">
									<FloatingLabel
										controlId="emailInput"
										label={`Email`}
									>
										<Form.Control
											type="email"
											placeholder="email"
											ref={email}
										></Form.Control>
									</FloatingLabel>
								</Form.Group>
								<Form.Group>
									<FloatingLabel
										controlId="passwordInput"
										label={`Password`}
									>
										<Form.Control
											type="password"
											placeholder="password"
											ref={password}
										></Form.Control>
									</FloatingLabel>
								</Form.Group>
							</Form>
							{err && <Alert variant="danger">{err}</Alert>}
						</Modal.Body>
						<Modal.Footer
							style={{
								display: "flex",
								justifyContent: "space-between",
								margin: "0 2rem",
							}}
						>
							<Button
								variant="contained"
								color="secondary"
								onClick={handleFormCancel}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={checkAuthCredentials}
							>
								Submit
							</Button>
						</Modal.Footer>
					</Modal>

					{/* modal for choosing update option */}
					<Modal
						size="md"
						show={showUpdateAccount}
						onHide={handleFormCancel}
						centered
					>
						<Modal.Header closeButton>
							<Modal.Title>
								What do you want to update?
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<div className="d-flex flex-column gap-2">
								<Button
									variant="contained"
									color="primary"
									onClick={handleEmailChange}
									disableElevation
								>
									Email
								</Button>
								<Button
									variant="contained"
									color="primary"
									onClick={handlePasswordChange}
									disableElevation
								>
									Password
								</Button>
								<Button
									variant="contained"
									color="error"
									onClick={handleAccountDelete}
									disableElevation
								>
									Delete Account
								</Button>
							</div>
						</Modal.Body>
					</Modal>

					{/* modal for updating account info (email, password, account delete) */}
					<Modal
						size="md"
						show={isReAuth}
						onHide={handleFormCancel}
						arua-lebelledby="update-esential-info"
						centered
					>
						<Modal.Header closeButton>
							<Modal.Title>Update {updateField}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form>
								{updateField === "email" && (
									<Form.Group>
										<Form.Label>New Email</Form.Label>
										<Form.Control
											type="email"
											ref={emailUpdate}
											placeholder="Email..."
											size="sm"
											required
										></Form.Control>
									</Form.Group>
								)}
								{updateField === "password" && (
									<Form.Group>
										<Form.Label
											style={{
												marginBottom: "0",
												marginTop: "0.5rem",
											}}
										>
											New Password
										</Form.Label>
										<Form.Control
											type="password"
											ref={passwordUpdate}
											placeholder="Password..."
											size="sm"
										></Form.Control>
										<Form.Label
											style={{
												marginBottom: "0",
												marginTop: "0.5rem",
											}}
										>
											Confirm New Password
										</Form.Label>
										<Form.Control
											type="password"
											ref={passwordConfirmUpdate}
											placeholder="Password confirm..."
											size="sm"
										></Form.Control>
										<Form.Text id="passwordBlockHelp" muted>
											{" "}
											Your password must be 6-12
											characters long, contain letters and
											numbers, and must not contain
											spaces.
										</Form.Text>
									</Form.Group>
								)}
								{updateField === "account" && (
									<Alert variant="danger">
										Deleting your account is permanent! Are
										you sure you want to proceed?
									</Alert>
								)}
							</Form>
							{updateError && (
								<Alert className="mt-2 mb-0" variant="danger">
									{updateError}
								</Alert>
							)}
						</Modal.Body>
						<Modal.Footer
							style={{
								display: "flex",
								justifyContent: "space-between",
								margin: "0 2rem",
							}}
						>
							<Button
								variant="contained"
								color="secondary"
								onClick={handleFormCancel}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={handleAccountUpdate}
							>
								Submit
							</Button>
						</Modal.Footer>
					</Modal>

					{/* modal for updating user info */}
					<Modal
						size="lg"
						show={showUpdateInfoModal}
						onHide={handleFormCancel}
						centered
					>
						<Modal.Header closeButton>
							<Modal.Title>Update Profile</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form onSubmit={handleFormSubmit}>
								<Form.Group className="mb-2">
									<div
										className="input-group"
										style={{
											position: "relative",
										}}
									>
										<img
											src={currentProfilePicture}
											style={{
												width: "7rem",
												height: "7rem",
												objectFit: "cover",
												borderRadius: "50%",
												marginRight: "0.5em",
											}}
											alt="current profile image"
										/>
										<div
											className="input-group-append"
											style={{
												position: "absolute",
												top: "2.2rem",
												left: "2.2rem",
											}}
										>
											<input
												type="file"
												id="changeProfileImageBtn"
												accept="image/*"
												onChange={(e) =>
													handleImageChange(e)
												}
												hidden
											/>
											<label
												htmlFor="changeProfileImageBtn"
												style={{
													color: "white",
													display: "inline-block",
													padding: "7px 7px",
													borderRadius: "15%",
													cursor: "pointer",
												}}
											>
												<AddAPhotoIcon />
											</label>
										</div>
									</div>
								</Form.Group>
								<div className="row">
									<Form.Group className="col-md-6 mb-1">
										<FloatingLabel
											controlId="nameInput"
											label={`Name (${currentUserInfo.name})`}
										>
											<Form.Control
												type="text"
												placeholder="name"
												ref={name}
											></Form.Control>
										</FloatingLabel>
									</Form.Group>
									<Form.Group className="col-md-6 mb-1">
										<FloatingLabel
											controlId="ageInput"
											label={`Age (${currentUserInfo.age})`}
										>
											<Form.Control
												type="number"
												placeholder="age"
												ref={age}
											></Form.Control>
										</FloatingLabel>
									</Form.Group>
								</div>
								<Form.Group className="mb-1">
									<FloatingLabel
										controlId="locationInput"
										label={`Location (${currentUserInfo.location})`}
									>
										<Form.Control
											type="text"
											placeholder="location"
											ref={location}
										></Form.Control>
									</FloatingLabel>
								</Form.Group>
								<Form.Group className="mb-1">
									<FloatingLabel
										controlId="aboutInput"
										label="A few words about you"
									>
										<Form.Control
											type="text"
											maxLength="50"
											placeholder="about"
											ref={about}
										></Form.Control>
									</FloatingLabel>
								</Form.Group>
							</Form>
						</Modal.Body>
						<Modal.Footer>
							<Button
								variant="contained"
								color="secondary"
								onClick={handleFormCancel}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={handleFormSubmit}
							>
								Save changes
							</Button>
						</Modal.Footer>
					</Modal>

					{/* user info */}
					<Card className="myinfo--container">
						<Card.Body className="myinfo--body">
							<OverlayTrigger
								placement="left"
								delay={{ show: "250", hide: "250" }}
								overlay={showEditTooltip}
							>
								<EditIcon
									style={{
										position: "absolute",
										top: "5%",
										right: "2%",
										cursor: "pointer",
									}}
									onClick={() => setShowUpdateInfoModal(true)}
								/>
							</OverlayTrigger>
							<OverlayTrigger
								placement="left"
								delay={{ show: "250", hide: "250" }}
								overlay={showAccountTooltip}
							>
								<AccountCircleIcon
									style={{
										position: "absolute",
										top: "25%",
										right: "2%",
										cursor: "pointer",
									}}
									onClick={() => setShowUpdateAccount(true)}
								/>
							</OverlayTrigger>
							<Card.Title className="myinfo--title">
								<img
									src={currentUserInfo.profileIMG}
									onClick={() => setShowPictureModal(true)}
									alt="user profile"
								/>
								<br></br>
								<h6>
									{currentUserInfo.name}{" "}
									<i>(@{currentUserInfo.handle})</i>
								</h6>
							</Card.Title>
							<Card.Body className="myinfo--info">
								<div className="d-flex flex-column align-items-center">
									<div className="d-flex align-items-center">
										<p style={{ margin: "0" }}>
											<LocationOnIcon fontSize="small" />
											<strong>
												{currentUserInfo.location}
											</strong>
										</p>
										<div className="vr mx-3" />
										<p style={{ margin: "0" }}>
											<strong>
												{currentUserInfo.age}
											</strong>
										</p>
									</div>
									{currentUserInfo.about && (
										<div>
											<p className="mb-0 mt-2">
												{currentUserInfo.about}
											</p>
										</div>
									)}
								</div>
							</Card.Body>
						</Card.Body>
					</Card>
					<PostMessage />
					<hr
						style={{
							borderTop: "2px solid #F23030",
						}}
					/>
					{follows.friendInfo && <Posts useCase="self" />}
					<Footer />
				</>
			)}
		</>
	)
}

export default MyPage
