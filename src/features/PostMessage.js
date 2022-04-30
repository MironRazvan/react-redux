import React, { useEffect, useRef, useState } from "react"
import { Form, Stack, Button } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db, storage } from "../firebase/firebase"
import { getDoc, doc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { nanoid } from "nanoid"
import { useDispatch } from "react-redux"
import { addNewMessage } from "./posts/postSlice"
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto"
import CancelIcon from "@mui/icons-material/Cancel"
import { useSelector } from "react-redux"
import { selectFollows } from "./follows/followsSlice"

function PostMessage() {
	const userMessage = useRef()
	const follows = useSelector(selectFollows)
	const [userImage, setUserImage] = useState(null)
	const [localUserImageURL, setLocalUserImageURL] = useState("")
	const dispatch = useDispatch()
	const [user] = useAuthState(auth)
	const [userHandle, setUserHandle] = useState("")

	async function handleSubmit(e) {
		e.preventDefault()
		let imageURL = ""
		if (userImage) {
			imageURL = await fetchImageURLFromFirebase()
		}
		if (imageURL != "" || userMessage.current.value != "") {
			let myProfileIMG
			follows.friendInfo.forEach((friend) => {
				if (friend.userID === user.uid) {
					myProfileIMG = friend.profileIMG
				}
			})
			dispatch(
				addNewMessage({
					userID: user.uid,
					handle: userHandle,
					handleLowercase: userHandle.toLocaleLowerCase(),
					// profileIMG: myProfileIMG,
					body: userMessage.current.value,
					image: imageURL,
				})
			)
		}
		setUserImage(null)
		handleCancelImageUpload()
		userMessage.current.value = ""
	}

	function getImageURLForPreview(event) {
		let reader = new FileReader()
		reader.readAsDataURL(event.target.files[0])
		reader.onload = (ev) => {
			setLocalUserImageURL(ev.target.result)
		}
		event.preventDefault()
	}

	async function fetchImageURLFromFirebase() {
		const fileName = user.uid + "_" + userImage.name + "_" + nanoid()
		const uploadRef = ref(storage, `users_uploads/${user.uid}/${fileName}`)
		let customURL = ""
		await uploadBytes(uploadRef, userImage).then(async (result) => {
			await getDownloadURL(result.ref).then((url) => {
				customURL = url
			})
		})
		return customURL
	}

	function handleCancelImageUpload() {
		setLocalUserImageURL(null)
		try {
			document.getElementById("actual-input").value = null
		} catch (error) {}
	}

	function handleChange(event) {
		getImageURLForPreview(event)
		setLocalUserImageURL(event.target.files[0])
		setUserImage(event.target.files[0])
	}

	useEffect(() => {
		let ignore = false

		if (!user) return

		const fetchHandle = async () => {
			const docUserInfo = doc(db, `user_info/${user.uid}`)
			const docInfo = await getDoc(docUserInfo)
			setUserHandle(docInfo.data().handle)
		}

		if (!ignore) {
			fetchHandle().catch((e) =>
				console.log("Error fetching handle for header")
			)
		}

		return () => {
			ignore = true
		}
	}, [localUserImageURL])

	return (
		<>
			<Form
				className="postMessage--container justify-content-center mb-2 mt-3"
				onSubmit={handleSubmit}
			>
				<Stack
					direction="horizontal"
					gap={3}
					className="d-flex justify-content-center align-items-center"
				>
					<div className="input-group">
						<input
							type="text"
							className="form-control"
							placeholder="New Message..."
							aria-label="Recipient's username"
							aria-describedby="basic-addon2"
							ref={userMessage}
							style={{
								display: "inline-block",
								padding: "7px 7px",
								background: "var(--custom-card-header)",
							}}
						/>
						<div className="input-group-append">
							<input
								type="file"
								id="actual-button"
								accept="image/*"
								hidden
								onChange={(e) => handleChange(e)}
							/>
							<label
								htmlFor="actual-button"
								style={{
									background: "white",
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
					<div className="vr" />
					<Button type="submit" variant="secondary">
						Post
					</Button>
				</Stack>
			</Form>
			{localUserImageURL && (
				<div
					style={{
						position: "relative",
						left: "25%",
						maxWidth: "50%",
					}}
				>
					<img
						className="postMessage--imgPreview"
						style={{ width: "100%" }}
						src={localUserImageURL}
					/>
					<CancelIcon
						style={{
							position: "absolute",
							right: "3%",
							top: "3%",
							color: "red",
							cursor: "pointer",
						}}
						onClick={handleCancelImageUpload}
					/>
				</div>
			)}
		</>
	)
}

export default PostMessage
