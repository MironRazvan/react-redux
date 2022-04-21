import React from "react"
import { Stack } from "react-bootstrap"

function Footer() {
	return (
		<Stack className="footer" direction="horizontal">
			<small>Miron Razvan-Alexandru©</small>
			<Stack direction="horizontal" gap={3}>
				<small>React Social</small>
				<div className="vr"></div>
				<small>2022</small>
			</Stack>
		</Stack>
	)
}

export default Footer
