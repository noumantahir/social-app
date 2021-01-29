/* @flow */

import {
  StyleSheet,
  Dimensions,
  } from "react-native";

import * as Values from './Values';

export const background = StyleSheet.create({
  card:{
    flex:1,
    borderColor:Values.Colors.COLOR_LIGHT_GRAY,
    borderWidth:1,
    borderRadius:Values.Dimens.CARD_BORDER_RADIUS,
    marginTop:Values.Dimens.CARD_TOP_MARGIN,
    marginLeft:Values.Dimens.CARD_SIDE_MARGIN,
    marginRight:Values.Dimens.CARD_SIDE_MARGIN,
    padding:Values.Dimens.CARD_INNER_PADDING,
    backgroundColor:'#fff'
  },

  cardNoPadding:{
    flex:1,
    borderColor:Values.Colors.COLOR_LIGHT_GRAY,
    borderWidth:1,
    borderRadius:Values.Dimens.CARD_BORDER_RADIUS,
    marginTop:Values.Dimens.CARD_TOP_MARGIN,
    marginLeft:Values.Dimens.CARD_SIDE_MARGIN,
    marginRight:Values.Dimens.CARD_SIDE_MARGIN,
    overflow:"hidden",
    backgroundColor:'#fff'
  },

  baseGround:{
    flex:1,
    backgroundColor:Values.Colors.COLOR_BACKGROUND,
  },
});

export const map = StyleSheet.create({
  minimap:{
      width:Dimensions.get('window').width,
      height:Values.Dimens.MINI_MAP_HEIGHT,
  },
  micromap:{
      width:Dimensions.get('window').width,
      height:Values.Dimens.MICRO_MAP_HEIGHT,
  },
  micromapSideMargined:{
      width:Dimensions.get('window').width - (Values.Dimens.CARD_SIDE_MARGIN * 2),
      height:Values.Dimens.MICRO_MAP_HEIGHT,
  },
});

  export const textInput = StyleSheet.create({
    label:{
      marginTop:12,
      marginLeft:4,
    },
    grayBorderedSingleLine:{
      height: 40,
      borderColor: Values.Colors.COLOR_LIGHT_GRAY,
      borderWidth: 1,
      backgroundColor: Values.Colors.COLOR_WHITE,
      borderRadius:8,
      padding:4,
    },
    grayBorderedMultiLine:{
      height: 120,
      fontSize: 20,
      borderColor: Values.Colors.COLOR_LIGHT_GRAY,
      borderWidth: 1,
      backgroundColor: Values.Colors.COLOR_WHITE,
      borderRadius:8,
      padding:4,
    },

  })

  export const text = StyleSheet.create({
    screenPlaceholder:{
      color:Values.Colors.COLOR_GRAY,
      fontSize:20,
      fontWeight:'600'
    }
  })

  export const picker = StyleSheet.create({
    selectedItemCategory:{
      marginLeft:16,
      backgroundColor:Values.Colors.COLOR_PRIMARY,
      borderColor:Values.Colors.COLOR_LIGHT_GRAY,
      borderRadius:16,
      paddingTop:4,
      paddingBottom:4,
      paddingRight:8,
      paddingLeft:8,
      borderWidth:1,
      color:Values.Colors.COLOR_WHITE,
      overflow:'hidden',
      fontSize:18,

    },
    unselectedItemCategory:{
      marginLeft:16,
      backgroundColor:Values.Colors.COLOR_WHITE,
      borderColor:Values.Colors.COLOR_LIGHT_GRAY,
      borderRadius:16,
      borderWidth:1,
      paddingTop:4,
      paddingBottom:4,
      paddingRight:8,
      paddingLeft:8,
      overflow:'hidden',
      fontSize:18,
    },
  });
