/* @flow */

 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   ScrollView,
   AsyncStorage,
   ActivityIndicator,
   TouchableWithoutFeedback,
   DeviceEventEmitter,
   Image,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../../utility/PostLinkerService';
 import  * as Values from '../../res/Values';
 import * as Styles from '../../res/Styles';
 import PostRankBar from '../../components/PostRankBar';

 import HelperMethods from '../../utility/HelperMethods';
 import CloudinaryHelpers from '../../utility/CloudinaryHelpers';

import FastImage from 'react-native-fast-image';

type Props = {
  post:any
}

type State = {
  regionString:string
}

export default class PostHeader extends React.Component<Props, State>{



render(){
  const post = this.props.post
  var regionString = post.regionString || this.state.regionString
  regionString = regionString ? (" " + regionString) : "";

  return(
    <View style={styles.container}>
      <View style={{flexDirection:'row', flex:1}}>
        <FastImage style={{height:32, width:32, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}
          resizeMode='contain'
          source={{uri: post.user.photoURL}} borderRadius={16} />
        <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
          <Text style={{fontWeight:'500', fontSize:16}}> {post.user.name || "Bucketlist User"}</Text>
          <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}}>{regionString}</Text>
        </View>

        <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}} >{HelperMethods.getShortTime(post.created_at)}</Text>
      </View>

      <Text style={{fontWeight:'500', fontSize:18, margin:4}}
        numberOfLines={2}
        >
        {post.title?post.title:post.description}
      </Text>
      {post.title?
        <Text style={{fontSize:12, color:Values.Colors.COLOR_GRAY}}
          >
          {post.description}
        </Text>
        :null
      }


      <PostRankBar
       post={post}
       isWishlist={this.props.isWishlistItem}
       onCommentsPress={this.props.onCommentsPress}
       onLikesPress={this.props.onLikesPress}
       />
    </View>
  )
}
}

const styles = StyleSheet.create({
  container:{
      flex:1,
      borderColor:Values.Colors.COLOR_LIGHT_GRAY,
      borderTopWidth:StyleSheet.hairlineWidth,
      borderBottomWidth:StyleSheet.hairlineWidth,
      marginTop:Values.Dimens.CARD_TOP_MARGIN,
      padding:8,
      backgroundColor:'#fff'
    }
})
