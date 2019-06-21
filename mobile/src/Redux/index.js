
import { createStore, combineReducers } from 'redux';
import TodoReducer from './Reducers/TodoReducer';

const rootReducer = combineReducers({
  todos: TodoReducer
});

const configureStore = () => {
  return createStore(rootReducer);
}

export default configureStore;
