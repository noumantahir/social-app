/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import * as Styles from '../res/Styles';
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
   TouchableOpacity,
   DeviceEventEmitter,
   Image,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../utility/PostLinkerService';
 import  * as Values from '../res/Values';
 import * as DatabaseHelpers from '../firebase/DatabaseHelpers';

 import HelperMethods from '../utility/HelperMethods';
 import CloudinaryHelpers from '../utility/CloudinaryHelpers';
 import PostHeader from './post_details_helpers/PostHeader';
 import FastImage from 'react-native-fast-image';
 import MediaItems from './post_details_helpers/MediaItems';

 type Props = {
   navigation:any
 }

 type State = {
   user:any,
   postKey:string,
   post:any,
   isWishlistItem:boolean,
 }

 export default class PostDetailsScreen extends Component<Props, State> {

   constructor(props){
     super(props)
     const postKey = this.props.navigation.state.params.postKey;
     const isWishlistItem = this.props.navigation.state.params.isWishlistItem || false;

     this.state = {postKey, post:{}, isLoading:true, isSelf:true, isWishlistItem};

     const uid = firebase.auth().currentUser.uid;
     firebase.database().ref("user").child(uid).once("value").then((snapshot)=>{
       const user = snapshot.val();
       if(user){
         this.setState({user});
       }
     });

     this.fetchPost()
   }



   fetchPost(){
      const uid = firebase.auth().currentUser.uid;
      const ref = this.state.isWishlistItem ?
          firebase.database().ref("user_data").child(uid).child("wishlist").child(this.state.postKey)
          :
          firebase.database().ref("post").child(this.state.postKey);

      ref.once("value").then((snapshot) => {
          var post = snapshot.val();

          if(post !== null){
              post.points = post.points || 0;

              const isSelf = (uid == post.uid);

              this.checkPostEntryInWishlist();
              this.setState({post, isLoading:false, isSelf});
            }
            else{
              alert("could not fetch data")
            }
        });
   }

   checkPostEntryInWishlist(){
     const uid = firebase.auth().currentUser.uid;

     if(!this.state.isWishlistItem){
       firebase.database().ref("user_data").child(uid).child("wishlist")
          .child(this.state.postKey).once('value').then((snapshot)=>{
              if(snapshot.val() !== null){
                this.setState({isWishlistItem:true})
              }
          });
     }
   }

   onRegionChange(region){

   }

   onMapReady(){

   }

   addToWishlist(){
    const uid = firebase.auth().currentUser.uid;
     var postKey = this.state.postKey;
     const ref =firebase.database().ref("user_data").child(uid).child("wishlist").child(postKey)
     this.pushPostToDatabase(ref, (status)=>{
        if(status){

          this.setState({isWishlistItem:true})
          DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_WISHLIST, {})
        }
     });

   }

   addToAchievements(){
     //TODO: update this...
     const ref = firebase.database().ref("post").push()
     const {isWishlistItem} = this.state;

     this.props.navigation.navigate("NewPost")

     // this.pushPostToDatabase(ref, (status)=>{
     //   if(status){
     //      alert("Added to your achievements")
     //
     //      if(isWishlistItem){
     //        this.removeFromWishlist();
     //      }
     //
     //      //link post
     //      PostLinkerService.linkPost(ref.key, -(new Date()).getTime());
     //
     //      this.setState({isSelf:true})
     //      DeviceEventEmitter.emit(Values.Strings.EVENT_REFRESH_WISHLIST, {})
     //    }
     // });
   }

   removeFromWishlist(){
          const uid = firebase.auth().currentUser.uid;
          const postKey = this.state.postKey;
          DatabaseHelpers.UserData.removePostFromWishlist(uid, postKey);
   }

   pushPostToDatabase(ref, callback){
     const uid = firebase.auth().currentUser.uid;
     const created_at =  (new Date()).getTime();
     var post = Object.assign({},this.state.post);
     var user = this.state.user;

     if(!user || !uid){
       alert("failed to process action at this time")
       return;
     }

     post.user = user;
     post.uid = uid;
     post.created_at = created_at;
     post.priority = -created_at
     post.points = 1;
     post.status = "pending";

     ref.set(post)
     ref.once("value").then((snapshot)=>{
        callback(snapshot.val() !== null)
     });
   }

   renderMap(region, curMarker){
     return (
       <View style={styles.mapContainer}>
           <MapView
             style = {Styles.map.micromapSideMargined}
             initialRegion={region}
             onRegionChange={(region) => this.onRegionChange(region)}
             onMapReady={() => this.onMapReady()}>

               <MapView.Marker
                 coordinate={curMarker}
                 title={"Selected Location"}
                 description={"Location for event"}
               />

         </MapView>
       </View>
     )
   }

   renderControls(){
     return (
       <View style={{flexDirection:'row'}} >

         { (this.state.isWishlistItem || this.state.isSelf) ? null :
           <TouchableOpacity onPress={()=>{this.addToWishlist()}}
           style={{
             flex:1,
             alignItems:"center",
             justifyContent:'center',
             padding:8,
             margin:8,
             borderRadius:16,
             backgroundColor:Values.Colors.COLOR_PRIMARY,
           }} >

             <View  >
               <Text style={{fontWeight:'600', color:Values.Colors.COLOR_WHITE}}>Add To Wishlist</Text>

             </View>
           </TouchableOpacity>
         }

         {
           this.state.isWishlistItem ?
           <TouchableOpacity
            onPress={()=>{this.removeFromWishlist()}}
             style={{
               flex:1,
               alignItems:"center",
               justifyContent:'center',
               padding:8,
               margin:8,
               borderRadius:16,
               backgroundColor:Values.Colors.COLOR_PRIMARY,
             }}>

               <View >
                 <Text style={{fontWeight:'600', color:Values.Colors.COLOR_WHITE}}>Remove From Wishlist</Text>
               </View>
           </TouchableOpacity>
           : null
         }

         {
           this.state.isWishlistItem ?
           <TouchableOpacity
             onPress={()=>{this.addToAchievements()}}
             style={{
               flex:1,
               alignItems:"center",
               justifyContent:'center',
               padding:8,
               margin:8,
               borderRadius:16,
               backgroundColor:Values.Colors.COLOR_PRIMARY,
             }}
             >
             <View >
               <Text style={{fontWeight:'600', color:Values.Colors.COLOR_WHITE}}>Add To Achievements</Text>
             </View>
           </TouchableOpacity>
           :null
         }
       </View>
     )
   }

   onCommentsPress = () =>{
     const params = {
       postKey:this.state.postKey
     }
     this.props.navigation.navigate(Values.Screens.SCREEN_COMMENTS_SCREEN, params)
   }

   onLikesPress = () =>{
     console.log('Opening users liked post');
     const postKey = this.state.postKey
     const ref = DatabaseHelpers.PostData.getLikesReference(postKey)
     const params = {databaseRef:ref, title:"Likes"}
     this.props.navigation.navigate(Values.Screens.SCREEN_USERS_LIST, params)
   }


   render(){
     var region = {}
     var curMarker = {}
     var points = 0;

     var media = null;

     if(!this.state.isLoading){
        region = this.state.post.region;
        curMarker = {longitude:region.longitude, latitude:region.latitude}
        points = this.state.post.points;
        media = this.state.post.media || null;
     }

    points += "";

     return (

       <View style={styles.background}>

        {this.state.isLoading ? <ActivityIndicator animating={true} /> :
          (<ScrollView>

          {this.renderMap(region, curMarker)}

          <PostHeader
            post={this.state.post}
            isWishlistItem={this.state.isWishlistItem}
            onCommentsPress={this.onCommentsPress}
            onLikesPress={this.onLikesPress}
            />

          <MediaItems mediaItems={media} />
          {this.renderControls()}

        </ScrollView>)}

        </View>

     )
   }

 }

 const styles = StyleSheet.create({
   background:{
     flex:1,
     backgroundColor:Values.Colors.COLOR_BACKGROUND,
   },
   mapContainer:{
     borderBottomWidth:1,
     borderColor:Values.Colors.COLOR_LIGHT_GRAY
   }
 })
