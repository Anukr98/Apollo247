
import React, { Component}  from 'react';
import { Platform, StyleSheet, Text, View, FlatList, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import BaseScene from './common/BaseScene';

class Home extends BaseScene {
	constructor(props) {
		super(props);
		this.showSpinner(true);
	}

	componentDidMount() {
		this.showSpinner(false);
	}

  renderRow(item, index, styles) {
    return (
      <Text style={styles.itemStyle}>{index+1}. {item.name}</Text>
    )
  }
	
	render() {
		const styles = this.styleSheet();
    return (
		<ImageBackground {...this.appImages().homeBg}>
			<View style={styles.container}>
				<Text
					style={styles.welcome}
					onPress={() => this.props.navigation.navigate('AddTodo')}
				>{this.ls('add')}</Text>

				<FlatList
					style={styles.listStyle}
					data={this.props.todos}
					renderItem={({ item, index }) => this.renderRow(item, index, styles)}
					/>
			</View>
			{this.renderSpinner()}
		</ImageBackground>
    );
  }

	defaultStyles() {
		const { Colors, ViewStyles } = this.theme();
			return{
				container: {
					...ViewStyles.container,
					padding: 20
				},
				welcome: {
					fontSize: 20,
					textAlign: 'right',
					margin: 10,
				},
				listStyle:{
					flex: 1
				},
				itemStyle: {
					fontSize: 20,
					padding: 5,
					borderBottomWidth: 1,
					borderColor: Colors.BLACK_COLOR,
					padding: 5
				}
			}
	}
}

export default connect(
	state => ({ todos: state.todos.list })
)(Home);
