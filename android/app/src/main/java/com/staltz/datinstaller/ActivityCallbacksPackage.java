package com.staltz.datinstaller;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ActivityCallbacksPackage implements ReactPackage {
    public ActivityCallbacksPackage() {
    }

    private ActivityCallbacksModule module;

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        this.module = new ActivityCallbacksModule(reactContext);
        return Arrays.<NativeModule>asList(this.module);
    }

    // Deprecated from RN 0.47
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    public Callback getStartedCallback() {
        if (this.module == null) {
            return null;
        }
        return this.module.startedCallback;
    }

    public Callback getStoppedCallback() {
        if (this.module == null) {
            return null;
        }
        return this.module.stoppedCallback;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}

