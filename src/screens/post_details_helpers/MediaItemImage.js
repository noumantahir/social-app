/* @flow */

import React, {Component} from 'react';
import {
  View,
  Button,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';


import * as Values from '../../res/Values';
import * as Styles from '../../res/Styles';

import FastImage from 'react-native-fast-image';

type Props = {
  source:any,
  viewHeight:number,
  viewWidth:number,
}
type State = {}

export default class MediaItemVideo extends React.Component<Props, State>{
  player:any

  render(){
    const source = this.props.source;
    if(!source) return null;
    const viewWidth = this.props.viewWidth;
    const viewHeight = this.props.viewHeight;


    return (
      <FastImage style={{
          marginTop:8,
          height:viewHeight,
          backgroundColor:'white',
          width:viewWidth,
          
        }
        }
          resizeMode='contain'
          source={source}
      />
    );
  }
}
