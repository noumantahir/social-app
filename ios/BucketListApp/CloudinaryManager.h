//
//  CloudinaryManager.h
//  BucketListApp
//
//  Created by Nouman Tahir on 30/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//


// CalendarManager.h
#import <React/RCTBridgeModule.h>
#import <Cloudinary/Cloudinary-Swift.h>

@interface CloudinaryManager : NSObject <RCTBridgeModule>
@property (nonatomic, readwrite) CLDCloudinary *cloudinary;
@property (nonatomic, readwrite) NSString *presetName;
@end
