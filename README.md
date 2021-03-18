# React-Native Android极光推送对接文档
## 版本信息
"jcore-react-native": "1.3.7",
"jpush-react-native": "2.5.10",
"react": "16.9.0",
"react-native": "0.61.5",
"react-native-permissions": "^3.0.1"
## 集成流程
1. yarn add jpush-react-native
2. yarn add jcore-react-native
3. react-native-permissions
4. android/app/build.gradle中配置:

5. link插件:jpush进行autoLink成功,jcore-react-native进行autoLink失败需要手动引入(build.gradle和settings.gradle中配置)
6. android/app/src/main/AndroidMainfest.xml中配置:

7. android/app/src/main/java/com/包名/下新建opensettings文件夹,在此文件夹下新建以下文件

OpenSettingsModule.java

package com.<projectname>.opensettings; // 记得把<projectname>改为你的项目名称
import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class OpenSettingsModule extends ReactContextBaseJavaModule {

    @Override
public String getName() {
/**
* return the string name of the NativeModule which represents this class in JavaScript
* In JS access this module through React.NativeModules.OpenSettings
*/
return "OpenSettings";
}

    @ReactMethod
public void openNetworkSettings(Callback cb) {
Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            cb.invoke(false);
            return;
        }
try {
currentActivity.startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS));
cb.invoke(true);
} catch (Exception e) {
cb.invoke(e.getMessage());
}
}

/* constructor */
public OpenSettingsModule(ReactApplicationContext reactContext) {
super(reactContext);
}
}
OpenSettingsPackage.java

package com.<projectname>.opensettings; // 记得把<projectname>改为你的项目名称
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class OpenSettingsPackage implements ReactPackage {
@Override
public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
List<NativeModule> modules = new ArrayList<>();

        modules.add(new OpenSettingsModule(reactContext));

        return modules;
    }

//   @Override
//   public List<<Class>? extends JavaScriptModule> createJSModules() {
//     return Collections.emptyList();
//   }

    @Override
public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
return Collections.emptyList();
}
}

8. android/app/src/main/java/com/包名/MainApplication.java中配置:
   (1) 引入

(2) 使用

9. 在rn下使用
   (1) 引入

(2) 推送权限提醒
checkNotifications().then(({status, settings}) => {
if (status == 'blocked') {
Alert.alert(
'检测到通知权限未打开',
'会影响异常报警时的通知,请前往开启通知权限',
[
{
text: '去设置',
onPress: () => {
NativeModules.OpenSettings.openNetworkSettings(data => {
console.log('call back data', data);
});
},
},
],
);
} else if (status == 'granted') {
console.log('通知权限已经打开', settings);
}
});
(3) jpush初始化,监听事件
jpush = () => {
// JPush.setLoggerEnable(true);
JPush.init();
//获取id
this.RegistrationID = result => {
let DeviceID = JSON.stringify(result);
DeviceID = DeviceID.split('"')[1] + '';
this.setState(
{
DeviceID,  //将要用来注册别名的id
},
() => {
this.ispolice();
},
);
};
JPush.getRegistrationID(this.RegistrationID);
//连接状态
this.connectListener = result => {
console.log('connectListener:' + JSON.stringify(result));
};
JPush.addConnectEventListener(this.connectListener);
//通知回调
this.notificationListener = result => {
console.log('notificationListener:' + JSON.stringify(result));
};
JPush.addNotificationListener(this.notificationListener);
//本地通知回调
this.localNotificationListener = result => {
console.log('localNotificationListener:' + JSON.stringify(result));
};
JPush.addLocalNotificationListener(this.localNotificationListener);
//自定义消息回调
this.customMessageListener = result => {
console.log('customMessageListener:' + JSON.stringify(result));
};
JPush.addCustomMessagegListener(this.customMessageListener);
//tag alias事件回调
this.tagAliasListener = result => {
console.log('tagAliasListener:' + JSON.stringify(result));
};
JPush.addTagAliasListener(this.tagAliasListener);
//手机号码事件回调
this.mobileNumberListener = result => {
console.log('mobileNumberListener:' + JSON.stringify(result));
};
JPush.addMobileNumberListener(this.mobileNumberListener);
};

(4) 注册别名
JPush.resumePush();
JPush.setAlias({sequence: 200, alias: DeviceID});
(5) 将注册完毕的别名发送给后台同事


## 注意:
1. jcore由于自身代码问题无法autoLink成功,需手动引入
2. 推送权限未开启Jpush推送将收不到,需要进行权限检测和提示申请
3. jpush集成完毕后要先去极光开发者平台注册APP的到Key,然后替换掉项目中的Key,cannle随变填写.
4. jpush配置完毕后,极光开发者平台可发送测试消息,测试是否成功.
5. 后台同事推送需要前台提供jpush上注册好的别名,否则推送无效.
