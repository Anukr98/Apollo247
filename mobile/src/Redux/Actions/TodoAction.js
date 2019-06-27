import { ADD_TODO, SAVE_USER_DATA } from '../Types';

export const addTodo = placeName => {
  return {
    type: ADD_TODO,
    payload: placeName
  }
}

export const saveUserData = data => {
  return {
    type: SAVE_USER_DATA,
    payload: data
  }
}
