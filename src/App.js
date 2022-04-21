import React from "react"
import Login from "./features/login/Login"
import Dash from "./features/Dash"
import "./App.css"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import UserPage from "./features/UserPage"
import MyPage from "./features/MyPage"

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route exact path="/" element={<Dash />} />
					<Route path="/login" element={<Login />} />
					<Route path="/userpage" element={<UserPage />} />
					<Route path="/mypage" element={<MyPage />} />
				</Routes>
			</Router>
		</>
	)
}

export default App
