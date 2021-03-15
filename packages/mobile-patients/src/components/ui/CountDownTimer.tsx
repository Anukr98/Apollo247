import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface CountDownTimerTypes {
  style?: StyleProp<TextStyle>;
  timer: number;
  onStopTimer?: () => void;
}

interface CountDownTimerState {
  timer: number;
  startTime: number;
  interval?: NodeJS.Timeout;
}

export class CountDownTimer extends React.Component<CountDownTimerTypes, CountDownTimerState> {
  constructor(props: CountDownTimerTypes) {
    super(props);
    this.state = { timer: props.timer || 900, startTime: props.timer || 900 };
  }

  componentDidMount() {
    const interval = setInterval(
      () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
      1000
    );
    this.setState({ interval });
  }

  componentDidUpdate() {
    if (this.state.timer === 0) {
      this.state.interval && clearInterval(this.state.interval);
      this.props.onStopTimer && this.props.onStopTimer();
    }
  }

  static getDerivedStateFromProps(nextProps: CountDownTimerTypes, prevState: CountDownTimerState) {
    if (nextProps.timer !== prevState.startTime) {
      return {
        timer: nextProps.timer,
        startTime: nextProps.timer,
      };
    }
  }

  componentWillUnmount() {
    this.state.interval && clearInterval(this.state.interval);
  }

  renderTime() {
    const minutes = Math.floor(this.state.timer / 60);
    const seconds = this.state.timer - minutes * 60;
    return `${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
      seconds.toString().length < 2 ? '0' + seconds : seconds
    }`;
  }
  render() {
    return <Text style={this.props.style}> {this.renderTime()} </Text>;
  }
}
