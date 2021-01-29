/*@flow*/

import React, {Component} from 'react';
import {View} from 'react-native'
import * as Values from '../res/Values';

type Props = {
  orientation:string,
}

export default class Separator extends React.Component<Props, *>{
  static get ORIENTATION_VERTICAL(){return 'vertical'}
  static get ORIENTATION_HORIZONTAL(){return 'horizontal'}

  render(){

    const height = this.props.orientation === Separator.ORIENTATION_VERTICAL?
      '100%':0.5;
    const width = this.props.orientation === Separator.ORIENTATION_VERTICAL?
      0.5:'100%';

    return(
      <View style={{
        height:height,
        width:width,
        backgroundColor:Values.Colors.COLOR_LIGHT_GRAY
      }} />
    )
  }
}
