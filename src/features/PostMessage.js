import React, { useEffect, useRef, useState } from "react"
import { Form, Stack, Button } from "react-bootstrap"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase/firebase"
import { getDoc, doc } from "firebase/firestore"
import { useDispatch } from "react-redux"
import { addNewMessage } from "./posts/postSlice"
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto"

function PostMessage() {
	const userMessage = useRef()
	const dispatch = useDispatch()
	const [user] = useAuthState(auth)
	const [userHandle, setUserHandle] = useState("")

	function handleSubmit(e) {
		e.preventDefault()
		dispatch(
			addNewMessage({
				userID: user.uid,
				handle: userHandle,
				handleLowercase: userHandle.toLocaleLowerCase(),
				body: userMessage.current.value,
			})
		)
		userMessage.current.value = ""
	}

	useEffect(() => {
		if (!user) return

		const fetchHandle = async () => {
			const docUserInfo = doc(db, `user_info/${user.uid}`)
			const docInfo = await getDoc(docUserInfo)
			setUserHandle(docInfo.data().handle)
		}

		fetchHandle().catch((e) =>
			console.log("Error fetching handle for header")
		)
	}, [])

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
							}}
						/>
						<div className="input-group-append">
							<input type="file" id="actual-button" hidden />
							<label
								htmlFor="actual-button"
								style={{
									background: "white",
									display: "inline-block",
									padding: "7px 7px",
									borderRadius: "15%",
								}}
							>
								<AddAPhotoIcon />
							</label>
						</div>
					</div>
					{/* <Form.Control
						type="text"
						placeholder="New Message"
						ref={userMessage}
					/> */}
					<div className="vr" />
					<Button type="submit" variant="secondary">
						Post
					</Button>
				</Stack>
			</Form>
		</>
	)
}

export default PostMessage
