
import { ADD_TODO, SAVE_USER_DATA } from '../Types';

const initialState = {
	name: '',
	list: [],
	userData: {}
};

const TodoReducer = (state = initialState, action) => {
	switch(action.type) {
		case ADD_TODO:
			return {
				...state,
				list: state.list.concat({
					name: action.payload
				})
			};
		case SAVE_USER_DATA:
				return {
					...state,
					userData: action.payload
				};
		default:
		return state;
	}
}

export default TodoReducer;
