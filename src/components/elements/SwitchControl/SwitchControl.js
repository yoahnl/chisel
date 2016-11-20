import React, {Component, PropTypes} from 'react';
import CSSModules from 'react-css-modules';
import _ from 'lodash/core';

import styles from './SwitchControl.sss';


@CSSModules(styles, {allowMultiple: true})
export default class SwitchControl extends Component {
  id = '0';
  
  componentWillMount() {
    this.id = _.uniqueId('switch_');
  }
  
  render() {
    const {title, checked, onChange} = this.props;
    return (
      <div styleName="SwitchControl">
        <input type="checkbox"
               styleName="checkbox"
               id={this.id}
               checked={checked}
               onChange={e => onChange(e.target.checked)}
        />
        <label styleName="label" htmlFor={this.id}>{title}</label>
      </div>
    );
  }
}
