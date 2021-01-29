/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   Platform,
   StyleSheet,
   TextInput,
   Button,
   Dimensions,
   FlatList,
   Image,
   TouchableWithoutFeedback,
   TouchableOpacity,
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import * as Values from '../res/Values'
 import * as Contract from '../firebase/DatabaseContract'
 import CloudinaryHelpers from '../utility/CloudinaryHelpers'
 import HelperMethods from '../utility/HelperMethods';
 import GeoHelpers from '../utility/GeoHelpers';
 import Ionicons from 'react-native-vector-icons/Ionicons';
 import MapView from 'react-native-maps'
 import * as Styles from '../res/Styles'
 import FastImage from 'react-native-fast-image';
 import MediaItemImage from '../screens/post_details_helpers/MediaItemImage';
 import MediaItemVideo from '../screens/post_details_helpers/MediaItemVideo';
 import PostActionPanel from './PostActionPanel';

type Props = {
  post:Contract.Post
}

type State = {

}

 export default class PostRankBar extends React.Component<Props, State>{
   render(){
     const post = this.props.post;

     const likesCount = post.likesCount || 0;
     const commentsCount = post.commentsCount || 0;

     const categoryLabel = post.categoryName || "General";

     const {labelLikes, colorLikes} = likesCount?
          {
            labelLikes:`${likesCount} Likes`,
            colorLikes:Values.Colors.COLOR_PURPLE
          }:{
            labelLikes:"No Likes",
            colorLikes:Values.Colors.COLOR_LIGHT_GRAY,
          }

     const {labelComments, colorComments} = commentsCount?
          {
            labelComments:`${commentsCount} Comments`,
            colorComments:Values.Colors.COLOR_ORANGE
          }:{
            labelComments:`No Comments`,
            colorComments:Values.Colors.COLOR_LIGHT_GRAY
          }

     const {labelCity, colorCity} = post.address_components?
          {
            labelCity:GeoHelpers.getCityWithCountryCode(post.address_components),
            colorCity:Values.Colors.COLOR_RED,
          }:{
            labelCity:null,
            colorCity:null
          };

     const {labelVerified, colorVerified} = post.status === 'approved'?
          {
            labelVerified:'Verified',
            colorVerified:Values.Colors.COLOR_GREEN,
          }:{
            labelVerified:null,
            colorVerified:Values.Colors.COLOR_LIGHT_GRAY
          };


     const adminEventLabel = post.type === 'admin_event'?
          ("Event - " + (post.points || 2) + " Points") : null;


    if(this.props.isWishlist){
      return (
        <View style={styles.container}>
          <RankElement
            label={labelCity}
            color={colorCity}
            />
        </View>
      )
    }

     return(
       <View style={styles.container}>

        <RankElement
          label={adminEventLabel}
          color='#FFC107'
          />

{
        // <RankElement
        //   label={categoryLabel}
        //   color='#2196F3'
        //   />
}
          <RankElement
            label={labelVerified}
            color={colorVerified}
            />

        <RankElement
          label={labelCity}
          color={colorCity}
          />


        <RankElement
          label={labelComments}
          color={colorComments}
          onPress={this.props.onCommentsPress}
          />

        <RankElement
          label={labelLikes}
          color={colorLikes}
          onPress={this.props.onLikesPress}
          />
    </View>
    )
   }
 }


 class RankElement extends React.Component<{}>{
   render(){
     const label = this.props.label
     const color = this.props.color

     if(!label)
      return null;

     return(
       <TouchableOpacity onPress={this.props.onPress} >
         <Text style={{
           borderRadius:12,
           borderWidth: 1,
           borderColor: '#fff',
           overflow:'hidden',
           paddingLeft:8,
           paddingRight:8,
           paddingTop:4,
           paddingBottom:4,
           marginRight:4,
           marginBottom:4,
           backgroundColor:color,
           color:'white',
           fontWeight:'600',
         }}
         >
          {label}
         </Text>
       </TouchableOpacity>
     )
   }
 }

const styles = StyleSheet.create({
  container:{
    margin:4,
    flexWrap:'wrap',
    alignItems:'flex-start',
    width:'100%',
    flexDirection:'row',
  }
})
