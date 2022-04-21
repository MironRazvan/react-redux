import { combineReducers, applyMiddleware } from "@reduxjs/toolkit"
import thunk from "redux-thunk"
import userReducer from "../features/login/loginSlice"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { createStore } from "@reduxjs/toolkit"
import postsReducer from "../features/posts/postSlice"

const rootReducer = combineReducers({
	user: userReducer,
	posts: postsReducer,
})

const persistConfig = {
	key: "root",
	storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, applyMiddleware(thunk))

export const persister = persistStore(store)
