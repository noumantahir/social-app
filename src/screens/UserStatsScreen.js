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
   AsyncStorage,
   ActivityIndicator,
   Text,
   View
 } from 'react-native';

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';


 export default class UserStatsScreen extends Component<{}> {

   static navigationOptions = {
     title:"Users Stats"
   }

   constructor(props){
     super(props);
     this.state = {isLoading:true};
   }

   componentDidMount(){
     this.fetchStats();
   }

   fetchStats(){

     const uid = this.props.navigation.state.params.uid;
     firebase.database().ref("user").child(uid).child("stats").orderByChild("priority").once('value')
          .then((snapshot)=>{

            var stats = []
            snapshot.forEach((childSnap) =>{

              var statsItem = childSnap.val();

              statsItem.key = childSnap.key;
              stats.push(statsItem);


            });

            this.setState({stats, isLoading:false});

          });
   }

   _renderItem = ({item}) => {

        return (
          <TouchableWithoutFeedback onPress={()=>{this.onUserClick(item.key)}}>
              <View style={styles.item}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.statusLabel}>{item.points}</Text>

              </View>
          </TouchableWithoutFeedback>
        )
   };

   onUserClick(uid){
      this.props.navigation.navigate("UserProfile", {uid})
   }


   render(){
     var stats = this.state.stats || []
     return (
       <View>
       {this.state.isLoading ? <ActivityIndicator style={{margin:16}} animating={true} /> : null}
       <FlatList
          data={stats}
          renderItem={this._renderItem}
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
     fontWeight:"600",
     marginTop:14,
   },

   itemTitle:{
     fontWeight:'600',
     fontSize:16,
   }
 })
