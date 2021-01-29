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
   AsyncStorage,
   Picker,
   ScrollView,
   TouchableWithoutFeedback,
   TouchableOpacity,
   ActivityIndicator,
   Image,
   Text,
   NativeModules,
   FlatList,
   DeviceEventEmitter,
   View
 } from 'react-native';

 import * as Styles from '../../res/Styles';
 import * as Values from '../../res/Values';
 import * as Contract from '../../firebase/DatabaseContract'
 import * as DatabaseHelpers from '../../firebase/DatabaseHelpers'

 import MapView from 'react-native-maps';
 import * as firebase from 'firebase';
 import PostLinkerService from '../../utility/PostLinkerService';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import NearbyLocationPicker from '../../components/new_post_components/NearbyLocationPicker';

class CategoryPicker extends Component<{}> {
  constructor(props){
    super(props);
    this.state = {selectedValue:"general"}
  }

  onSelection(item){
    this.props.onSelection(item);
    this.setState({selectedValue:item.key})
  }

 render(){
     return (
       <FlatList style={{marginTop:12, paddingBottom:12,}} horizontal={true} data={this.props.categories}
         extraData={this.state.selectedValue}
         renderItem={({item})=>{
           const viewHeight = 128;
           const viewWidth = viewHeight * (item.imgWidth/item.imgHeight)
           const itemStyle = (this.state.selectedValue === item.key) ?
             Styles.picker.selectedItemCategory : Styles.picker.unselectedItemCategory;
           return (
                 <TouchableOpacity key={item.key} onPress={()=>{this.onSelection(item)}}>
                   <View>
                     <Text style={itemStyle}>{item.name}</Text>
                   </View>
                 </TouchableOpacity>
         );
       }} />
     )
   }
}
