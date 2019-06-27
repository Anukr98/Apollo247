
import React, { Component }  from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { connect } from 'react-redux';
import { addTodo } from '../Redux/Actions/TodoAction';
class AddTodo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.handleAddTodo = this.handleAddTodo.bind(this)
    }
    handleAddTodo() {
        this.props.addTodo(this.state.value);
        this.props.navigation.goBack();
    }

    render() {
        console.log(this.props.todos, 'todos')
        return (
            <View style={styles.container}>
                <Text style={styles.heading}>Add Todo</Text>
                <TextInput
                    placeholder = "Write here"
                    style = { styles.inputStyle }
                    value = { this.state.value }
                    onChangeText = {(value) => this.setState({ value }) }
                />
                <Button title = 'Add' 
                    style = { styles.buttonStyle }
                    onPress = {this.handleAddTodo}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        padding: 20
    },
    inputStyle: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dddddd',
        height: 40
    },
    buttonStyle: {
        width: '30%',
        backgroundColor: 'black'
    },
});

export default connect(
    null,
    { addTodo: addTodo }
)(AddTodo);
