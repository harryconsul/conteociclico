package com.conteociclico;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnfs.RNFSPackage;
import com.terrylinla.rnsketchcanvas.SketchCanvasPackage;
import org.reactnative.camera.RNCameraPackage;
import io.realm.react.RealmReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;



import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  
    @Override
    public boolean isDebug() {
      return BuildConfig.DEBUG;
    }

    
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new RealmReactPackage(),
            new RNCameraPackage(),
            new SketchCanvasPackage(),
            new RNFSPackage()
      );
    }
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
      return getPackages();
    }
    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
           @Override
            protected String getJSMainModuleName() {
               return "index";
           }
        };
        return new ReactGateway(this, isDebug(), host);
    }
 
  
}
