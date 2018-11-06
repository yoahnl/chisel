import React, {Component} from 'react';
import CSSModules from 'react-css-modules';

import CheckboxControl from "components/elements/CheckboxControl/CheckboxControl";
import InputControl from "components/elements/InputControl/InputControl";
import DropdownControl from "components/elements/DropdownControl/DropdownControl";
import InputNumberControl from "components/elements/InputNumberControl/InputNumberControl";
import {BYTES, DATA_UNITS, convertDataUnits} from 'utils/common';
import {FILE_SIZE_MAX} from 'ConnectConstants';

import styles from '../FieldModal.sss';




@CSSModules(styles, {allowMultiple: true})
export default class ValidationMedia extends Component {
  state = {
    fileSize: {
      active: false,
      min: 0,
      max: 0,
      minActive: true,
      maxActive: true,
      minUnit: BYTES,
      maxUnit: BYTES,
      errorMsg: ''
    }
  };
  maxForMin = FILE_SIZE_MAX;
  maxForMax = FILE_SIZE_MAX;
  
  constructor(props) {
    super(props);
    
    Object.assign(this.state, props.validations);
  }
  
  onSizeActive = value => {
    this.setState({fileSize: {
        ...this.state.fileSize,
        active: value
      }}, this.update);
  };
  
  onSizeMin = value => {
    this.setState({fileSize: {
        ...this.state.fileSize,
        min: value
      }}, this.update);
  };
  
  onSizeMax = value => {
    this.setState({fileSize: {
        ...this.state.fileSize,
        max: value
      }}, this.update);
  };
  
  onSizeMinActive = value => {
    let {maxActive} = this.state.fileSize;
    if (!value)
      maxActive = true;
    this.setState({fileSize: {
        ...this.state.fileSize,
        minActive: value,
        maxActive
      }}, this.update);
  };
  
  onSizeMaxActive = value => {
    let {minActive} = this.state.fileSize;
    if (!value)
      minActive = true;
    this.setState({fileSize: {
        ...this.state.fileSize,
        maxActive: value,
        minActive
      }}, this.update);
  };
  
  onSizeMinUnit = newMinUnit => {
    let {min, minUnit} = this.state.fileSize;
    
    min = convertDataUnits(min, minUnit, newMinUnit);
    this.maxForMin = convertDataUnits(FILE_SIZE_MAX, BYTES, newMinUnit);
    
    this.setState({fileSize: {
        ...this.state.fileSize,
        min,
        minUnit: newMinUnit
      }}, this.update);
  };
  
  onSizeMaxUnit = newMaxUnit => {
    let {max, maxUnit} = this.state.fileSize;
  
    max = convertDataUnits(max, maxUnit, newMaxUnit);
    this.maxForMax = convertDataUnits(FILE_SIZE_MAX, BYTES, newMaxUnit);
    
    this.setState({fileSize: {
        ...this.state.fileSize,
        max,
        maxUnit: newMaxUnit
      }}, this.update);
  };
  
  onSizeErrorMsg = event => {
    const {value} = event.target;
    this.setState({fileSize: {
        ...this.state.fileSize,
        errorMsg: value
      }}, this.update);
  };
  
  update = () => {
    this.props.update(this.state);
  };
  
  render() {
    let errorRange = false;
    if (this.state.fileSize.active && this.state.fileSize.minActive && this.state.fileSize.maxActive) {
      const min = convertDataUnits(this.state.fileSize.min, this.state.fileSize.minUnit, BYTES);
      const max = convertDataUnits(this.state.fileSize.max, this.state.fileSize.maxUnit, BYTES);
      errorRange = min > max;
    }
    
    return (
      <div>
        <div styleName="validation">
          <div styleName="switch">
            <CheckboxControl title="Accept only specified file size"
                             checked={this.state.fileSize.active}
                             onChange={this.onSizeActive} />
          </div>
          <div styleName="size">
            <CheckboxControl title="Min"
                             checked={this.state.fileSize.minActive}
                             onChange={this.onSizeMinActive}
                             disabled={!this.state.fileSize.active} />
            <div styleName="size-field">
              <InputNumberControl onChange={this.onSizeMin}
                                  value={this.state.fileSize.min}
                                  isInt={true}
                                  min={0}
                                  max={this.maxForMin}
                                  readOnly={!this.state.fileSize.active || !this.state.fileSize.minActive} />
            </div>
            <div styleName="size-unit">
              <DropdownControl disabled={!this.state.fileSize.active || !this.state.fileSize.minActive}
                               suggestionsList={DATA_UNITS}
                               suggest={this.onSizeMinUnit}
                               current={this.state.fileSize.minUnit} />
            </div>
            
            <CheckboxControl title="Max"
                             checked={this.state.fileSize.maxActive}
                             onChange={this.onSizeMaxActive}
                             disabled={!this.state.fileSize.active} />
            <div styleName="size-field">
              <InputNumberControl onChange={this.onSizeMax}
                                  value={this.state.fileSize.max}
                                  isInt={true}
                                  min={0}
                                  max={this.maxForMax}
                                  readOnly={!this.state.fileSize.active || !this.state.fileSize.maxActive} />
            </div>
            <div styleName="size-unit">
              <DropdownControl disabled={!this.state.fileSize.active || !this.state.fileSize.maxActive}
                               suggestionsList={DATA_UNITS}
                               suggest={this.onSizeMaxUnit}
                               current={this.state.fileSize.maxUnit} />
            </div>
          </div>
          <InputControl label="Custom error message"
                        onChange={this.onSizeErrorMsg}
                        value={this.state.fileSize.errorMsg}
                        readOnly={!this.state.fileSize.active} />
          {errorRange &&
            <div styleName="error">
              Error: the min value should be smaller than max value! Please, fix it.
            </div>
          }
        </div>
      </div>
    );
  }
}