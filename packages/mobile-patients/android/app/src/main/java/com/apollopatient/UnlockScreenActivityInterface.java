package com.apollopatient;

import com.facebook.react.bridge.ReadableMap;

public interface UnlockScreenActivityInterface {
    public void onConnected();

    public void onConnectFailure();

    public void onIncoming(ReadableMap params);
}
