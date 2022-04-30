import React, { useEffect, useState, useRef } from "react"
import {
	Spinner,
	Card,
	Modal,
	OverlayTrigger,
	Tooltip,
	Form,
	FloatingLabel,
} from "react-bootstrap"
import { Button } from "@mui/material"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { auth, db, storage } from "../firebase/firebase"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import Footer from "./Footer"
import Header from "./Header"
import Posts from "./posts/Posts"
import PostMessage from "./PostMessage"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import EditIcon from "@mui/icons-material/Edit"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyPosts, selectPosts } from "./posts/postSlice"
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto"
import {
	selectFollows,
	updateIMG,
	updateName,
	updateAge,
	updateLocation,
	updateAbout,
} from "./follows/followsSlice"

function MyPage() {
	const navigate = useNavigate()
	const dispatch = useDispatch()

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

	const showTooltip = (props) => {
		return <Tooltip {...props}>Edit profile details</Tooltip>
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
			const storageRef = ref(
				storage,
				`users_uploads/${user.uid}/${user.uid}_PROFILE`
			)
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
		const fileName = user.uid + "_" + "PROFILE"
		const uploadRef = ref(storage, `users_uploads/${user.uid}/${fileName}`)
		let customURL = ""
		await uploadBytes(uploadRef, userImage).then(async (result) => {
			await getDownloadURL(result.ref).then((url) => {
				customURL = url
			})
		})
		return customURL
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
						setCurrentUserInfo(friend)
						setCurrentProfilePicture(friend.profileIMG)
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
						aria-labelledby="show-fullscreen-image"
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

					{/* modal for updating user info */}
					<Modal
						size="lg"
						show={showUpdateInfoModal}
						onHide={handleFormCancel}
						aria-labelledby="update-user-info"
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
								overlay={showTooltip}
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

							<Card.Title className="myinfo--title">
								<img
									src={currentUserInfo.profileIMG}
									onClick={() => setShowPictureModal(true)}
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
