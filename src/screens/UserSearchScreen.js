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
   TouchableWithoutFeedback,
   TouchableHighlight,
   AsyncStorage,
   ActivityIndicator,
   Image,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import * as Styles from '../res/Styles';
 import * as Values from '../res/Values';

 export default class UserSearchScreen extends Component<{}> {

   static navigationOptions = {
     title:"Users Search"
   }

   constructor(props){
     super(props);
     this.state = {isLoading:true, searchQuery:""};
   }

   componentDidMount(){
     this.searchUsers();
   }

   searchUsers(){
     const searchQuery = this.state.searchQuery;
     this.setState({isLoading:true, users:[]})

     var ref = firebase.database().ref("user").orderByChild("tag").startAt(searchQuery)
          .endAt(searchQuery+"\uf8ff");

     if(searchQuery == "")
      ref = firebase.database().ref("user").orderByChild("name");

     ref.once('value').then((snapshot)=>{

            var users = []
            snapshot.forEach((childSnap) =>{

              var user = childSnap.val();

              user.key = childSnap.key;
              users.push(user);

            });

            this.setState({users, isLoading:false});

          });
   }

   _renderItem = (item) => {
        const user = item.item;

        const numFollowers = user.numFollowers || 0;
        const numFollowings = user.numFollowings || 0;
        const name = user.name || "BucketList User";
        const photoURL = user.photoURL;
        const body = numFollowers + " Followers, " + numFollowings + " Following"
        return (
          <TouchableHighlight underlayColor={Values.Colors.COLOR_LIGHT_GRAY} onPress={()=>{this.onUserClick(user.key)}}>
              <View style={Styles.background.card}>
                <View style={{flexDirection:'row', flex:1}}>
                  <Image style={{height:32, width:32, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}
                    resizeMode='contain'
                    source={{uri: photoURL}} borderRadius={16} />
                  <View style={{flex:1, flexDirection:'column', marginLeft:4}}>
                    <Text style={{fontWeight:'500', fontSize:16}}> {name}</Text>
                    <Text style={{color:Values.Colors.COLOR_GRAY, fontSize:12}}>{body }</Text>
                  </View>


                </View>
              </View>
          </TouchableHighlight>
        )
   };

   onUserClick(uid){
      this.props.navigation.navigate("UserProfile", {uid})
   }

   _renderHeader = ()=>{
     return(
       <View>
         <View style={Styles.background.card} >
            <TextInput
              style={{
                width:Dimensions.get('window').width,

              }}
              numberOfLines = {4}
              placeholder="Search by name"
              onChangeText={(text)=>{
                this.state.searchQuery = text.toLowerCase()
                this.searchUsers();
              }}
              />
            </View>
         </View>
     )
   }

   _renderFooter = () => {
     return (
        <View>
          {this.state.isLoading ? <ActivityIndicator style={{margin:16}} animating={true} /> : null}
        </View>
      )
   }


   render(){
     var users = this.state.users || []
     return (
       <View style={{flex:1}}>

         <FlatList
            data={users}
            renderItem={this._renderItem}
            ListHeaderComponent={this._renderHeader}
            ListFooterComponent={this._renderFooter}
          />
       </View>
     )
   }
 }

 const styles = StyleSheet.create({
   item:{
     flex:1,
     borderColor:'gray',
     borderWidth:1,
     borderRadius:8,
     margin:8,
     padding:8,
     backgroundColor:'#fff'
   },

   statusLabel:{
     fontWeight:"bold",
     marginTop:16,
   },

   itemTitle:{
     fontWeight:'bold',
     fontSize:18,
   }
 });
