package com.staltz.datinstaller;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ActivityCallbacksModule  extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public Callback startedCallback;
    public Callback stoppedCallback;

    public ActivityCallbacksModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ActivityCallbacks";
    }

    @ReactMethod
    public void setStartedListener(Callback startedCallback) {
        this.startedCallback = startedCallback;
    }

    @ReactMethod
    public void setStoppedListener(Callback stoppedCallback) {
        this.stoppedCallback = stoppedCallback;
    }
}
