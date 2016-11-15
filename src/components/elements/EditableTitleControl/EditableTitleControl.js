import React, {Component, PropTypes} from 'react';
import CSSModules from 'react-css-modules';

import styles from './EditableTitleControl.sss';


const MIN_TEXT = 'WWWW';

@CSSModules(styles, {allowMultiple: true})
export default class EditableTitleControl extends Component {
  state = {
    text: '',
    editing: false,
    width: 0
  };
  testTextElm = null;
  minTextWidth = 0;


  setText(text) {
    let wText = text;
    if (!wText)
      wText = this.props.placeholder;
    if (!wText)
      wText = MIN_TEXT;

    this.testTextElm.innerText = wText;
    let width = this.testTextElm.clientWidth * 1.1;
    if (width < this.minTextWidth)
      width = this.minTextWidth;

    this.setState({text, width});
  }

  componentWillReceiveProps(nextProps) {
    this.setText(nextProps.text);
  }

  componentDidMount() {
    this.testTextElm = document.createElement('div');
    let style = {
      fontSize: this.props.isSmall ? '12px' : '20px',
      opacity: '.01',
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex:'-1',
    };
    Object.assign(this.testTextElm.style, style);
    document.body.appendChild(this.testTextElm);
  
    this.testTextElm.innerText = MIN_TEXT;
    this.minTextWidth = this.testTextElm.clientWidth * 1.1;

    this.setText(this.props.text);
  }

  onEditClick = () => {
    this.setState(
      {editing: true},
      () => this.refs.input.focus()
    );
  };

  onChange = event => {
    this.setText(event.target.value);
  };

  onBlur = () => {
    this.setState({editing: false});
    this.props.cancel();
  };

  onKeyDown = event => {
    if (this.props.alertShowing)
      return;

    //Enter pressed
    if (event.keyCode == 13) {
      this.props.update(this.title);
      //Esc pressed
    } else if (event.keyCode == 27) {
      this.props.cancel();
    }
  };

  render() {
    const {placeholder, isSmall} = this.props;

    let styleName = "input";
    if (this.state.editing)
      styleName += " input-editing";
    if (isSmall)
      styleName += " input-small";

    return (
      <div styleName="wrapper">
        <input style={{width: this.state.width + 'px'}}
               ref="input"
               styleName={styleName}
               value={this.state.text}
               readOnly={!this.state.editing}
               placeholder={placeholder}
               onBlur={this.onBlur}
               onChange={this.onChange}
               onKeyDown={this.onKeyDown} />
        <div styleName="edit"
             onClick={this.onEditClick}>
          edit
        </div>
      </div>
    );
  }
}
