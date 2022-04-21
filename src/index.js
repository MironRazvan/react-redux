import React from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { store } from "./app/store"
import { persister } from "./app/store"
import { Provider } from "react-redux"
import * as serviceWorker from "./serviceWorker"
import { PersistGate } from "redux-persist/integration/react"

const root = createRoot(document.getElementById("root"))
root.render(
	<Provider store={store}>
		<React.StrictMode>
			<PersistGate loading={null} persistor={persister}>
				<App />
			</PersistGate>
		</React.StrictMode>
	</Provider>
)

serviceWorker.unregister()
