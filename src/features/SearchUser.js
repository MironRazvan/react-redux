import React, { useState } from "react"
import {
	collection,
	getDocs,
	orderBy,
	query,
	startAt,
	endAt,
} from "firebase/firestore"
import { Form, Button, Accordion } from "react-bootstrap"
import { db } from "../firebase/firebase"
import { nanoid } from "nanoid"

function SearchUser(props) {
	const [userInput, setUserInput] = useState("")
	const [handleList, setHandleList] = useState([])

	function resetStateHandleList() {
		setHandleList([
			{
				username: "",
				realName: "",
				userID: "",
			},
		])
	}

	async function fetchHandles(event) {
		event.preventDefault()

		// checks for user input
		if (userInput === "") {
			resetStateHandleList()
			return
		}

		// reset state
		resetStateHandleList()

		// queries db for usernames
		const dbRef = collection(db, "user_info")
		const q = query(
			dbRef,
			orderBy("handle_lowercase", "asc"),
			startAt(userInput.toLowerCase()),
			endAt(userInput.toLowerCase() + "\uf8ff")
		)
		const querySnap = await getDocs(q)

		// adding results to state variable
		querySnap.forEach((element) => {
			setHandleList((prevState) => [
				...prevState,
				{
					realName: element.data().name,
					username: element.data().handle,
					userID: element.data().userID,
					likes: element.data().likes,
					comments: element.data().comments,
				},
			])
		})
	}

	function handleChange(event) {
		setUserInput(event.target.value)
	}

	return (
		<>
			<Accordion flush>
				<Accordion.Item eventKey="0">
					<Accordion.Header>Search for users...</Accordion.Header>
					<Accordion.Body
						style={{
							backgroundColor: "var(--custom-card-body)",
							color: "var(--custom-card-text-colored)",
						}}
					>
						<Form
							style={{ display: "flex" }}
							onSubmit={fetchHandles}
						>
							<Form.Control
								type="text"
								placeholder="Type someones @..."
								value={userInput}
								style={{
									background: "var(--custom-card-header)",
									color: "var(--custom-card-text-colored)",
								}}
								onChange={(event) => handleChange(event)}
							></Form.Control>
							<Button
								variant="dark"
								type="submit"
								size="sm"
								style={{ color: "#FF4C29" }}
							>
								Search
							</Button>
						</Form>
						{handleList.length > 0 &&
							handleList
								.filter((value) => value.realName !== "")
								.map((newUser) => (
									<div key={nanoid()}>
										<hr
											style={{
												borderTop: "2px solid #F23030",
											}}
										/>
										<div
											className="dash--user--searched"
											key={nanoid()}
											onClick={(event) =>
												props.handleClick(
													event,
													newUser.username,
													newUser.userID
												)
											}
										>
											{newUser.realName} (
											<strong>@{newUser.username}</strong>
											)
										</div>
									</div>
								))}
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		</>
	)
}

export default SearchUser
