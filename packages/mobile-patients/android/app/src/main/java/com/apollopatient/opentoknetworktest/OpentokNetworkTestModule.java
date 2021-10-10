package com.apollopatient.opentoknetworktest;


import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.opentok.android.OpentokError;
import com.opentok.android.Publisher;
import com.opentok.android.PublisherKit;
import com.opentok.android.Session;
import com.opentok.android.Stream;
import com.opentok.android.Subscriber;
import com.opentok.android.SubscriberKit;

import io.reactivex.Observable;
import io.reactivex.Scheduler;
import io.reactivex.schedulers.Schedulers;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

public class OpentokNetworkTestModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    private static final String LOGTAG = "quality-stats-demo";
    private Session mSession;
    private Publisher mPublisher;
    private Subscriber mSubscriber;

    private double mVideoPLRatio = 0.0;
    private long mVideoBw = 0;

    private long mPrevVideoPacketsLost = 0;
    private long mPrevVideoPacketsRcvd = 0;
    private double mPrevVideoTimestamp = 0;
    private long mPrevVideoBytes = 0;

    private long mStartTestTime = 0;

    private boolean audioOnly = false;

    private static final int TEST_DURATION = 20; //test quality duration in seconds
    private static final int TIME_WINDOW = 3; //3 seconds
    private static final int TIME_VIDEO_TEST = 15; //time interval to check the video quality in seconds


    public OpentokNetworkTestModule(@NonNull ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "OpentokNetworkTest";
    }

    @ReactMethod
    public void doSomeWork(String name) {
        // Log.d(LOGTAG, "doSomeWork: " + name + " do some work");
    }


    @ReactMethod
    public void startNetworkTest(String API_KEY, String SESSION_ID, String TOKEN, Promise promise) {
        //Log.d(LOGTAG, "startNetworkTest ---- ");
        sessionConnect(API_KEY, SESSION_ID, TOKEN, promise);
        final Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                //  Log.i(LOGTAG, "Timeout after 30000 secs --- ");
                promise.resolve("BAD: Voice-only - Your bandwidth is too low for video");
            }
        }, 30000);


    }

    public void sessionConnect(String API_KEY, String SESSION_ID, String TOKEN, Promise promise) {
        // Log.i(LOGTAG, "Connecting session");
        if (mSession == null) {
            // Log.i(LOGTAG, "mSession session null");

            mSession = new Session.Builder(reactContext, API_KEY, SESSION_ID).build();
            mSession.setSessionListener(new Session.SessionListener() {
                @Override
                public void onConnected(Session session) {
                    // Log.i(LOGTAG, "Session is connected");

                    mPublisher = new Publisher.Builder(reactContext).build();
                    // Log.i(LOGTAG, "Created new publisher -- " + mPublisher);

                    mPublisher.setPublisherListener(new PublisherKit.PublisherListener() {
                        @Override
                        public void onStreamCreated(PublisherKit publisherKit, Stream stream) {
                            // Log.i(LOGTAG, "Publisher onStreamCreated");
                            if (mSubscriber == null) {
                                subscribeToStream(stream, promise);
                            }
                        }

                        @Override
                        public void onStreamDestroyed(PublisherKit publisherKit, Stream stream) {
                            // Log.i(LOGTAG, "Publisher onStreamDestroyed");
                            if (mSubscriber == null) {
                                unsubscribeFromStream(stream);
                            }
                        }

                        @Override
                        public void onError(PublisherKit publisherKit, OpentokError opentokError) {
//                            Log.i(LOGTAG, "Publisher kit: " + publisherKit.getName());
//                            Log.i(LOGTAG, "Publisher error: " + opentokError.getMessage());


                            promise.resolve("BAD: Voice-only - Your bandwidth is too low for video");
                        }
                    });
                    mPublisher.setAudioFallbackEnabled(true);

                    // Log.i(LOGTAG, "Publishing -- " + mPublisher + mSession);

                    mSession.publish(mPublisher);
                }

                @Override
                public void onDisconnected(Session session) {
                    // Log.i(LOGTAG, "Session is disconnected");

                    mPublisher = null;
                    mSubscriber = null;
                    mSession = null;


                }

                @Override
                public void onStreamReceived(Session session, Stream stream) {
                    // Log.i(LOGTAG, "Session onStreamReceived");
                }

                @Override
                public void onStreamDropped(Session session, Stream stream) {
                    // Log.i(LOGTAG, "Session onStreamDropped");
                }

                @Override
                public void onError(Session session, OpentokError opentokError) {
                    // Log.i(LOGTAG, "Session error: " + opentokError.getMessage());

                    promise.resolve("BAD: Voice-only - Your bandwidth is too low for video");
                }
            });

            // Log.i(LOGTAG, "Checking your available bandwidth Please wait ! ");
            mSession.connect(TOKEN);
        } else {
            // Log.i(LOGTAG, "mSession session not null");
        }
    }

    private void subscribeToStream(Stream stream, Promise promise) {
        //Log.i(LOGTAG, "subscribeToStream -- ");
        mSubscriber = new Subscriber.Builder(reactContext, stream).build();
        mSubscriber.setSubscriberListener(new SubscriberKit.SubscriberListener() {
            @Override
            public void onConnected(SubscriberKit subscriberKit) {
                // Log.i(LOGTAG, "Subscriber onConnected");
            }

            @Override
            public void onDisconnected(SubscriberKit subscriberKit) {
                //       Log.i(LOGTAG, "Subscriber onDisconnected");
            }

            @Override
            public void onError(SubscriberKit subscriberKit, OpentokError opentokError) {
                //Log.i(LOGTAG, "Subscriber error: " + opentokError.getMessage());
                promise.resolve("BAD: Voice-only - Your bandwidth is too low for video");
            }
        });
        mSession.subscribe(mSubscriber);
        mSubscriber.setVideoStatsListener(new SubscriberKit.VideoStatsListener() {

            @Override
            public void onVideoStats(SubscriberKit subscriber,
                                     SubscriberKit.SubscriberVideoStats stats) {

                if (mStartTestTime == 0) {
                    mStartTestTime = System.currentTimeMillis() / 1000;
                }
                checkVideoStats(stats);

                //check quality of the video call after TIME_VIDEO_TEST seconds
                if (((System.currentTimeMillis() / 1000 - mStartTestTime) > TIME_VIDEO_TEST) && !audioOnly) {
                    checkVideoQuality(promise);
                }
            }
        });
    }

    private void unsubscribeFromStream(Stream stream) {
        if (mSubscriber.getStream().equals(stream)) {
            mSubscriber = null;
        }
    }

    private void checkVideoStats(SubscriberKit.SubscriberVideoStats stats) {
        //Log.i(LOGTAG, "checkVideoStats -- ");

        double videoTimestamp = stats.timeStamp / 1000;

        //initialize values
        if (mPrevVideoTimestamp == 0) {
            mPrevVideoTimestamp = videoTimestamp;
            mPrevVideoBytes = stats.videoBytesReceived;
        }

        if (videoTimestamp - mPrevVideoTimestamp >= TIME_WINDOW) {
            //calculate video packets lost ratio
            if (mPrevVideoPacketsRcvd != 0) {
                long pl = stats.videoPacketsLost - mPrevVideoPacketsLost;
                long pr = stats.videoPacketsReceived - mPrevVideoPacketsRcvd;
                long pt = pl + pr;

                if (pt > 0) {
                    mVideoPLRatio = (double) pl / (double) pt;
                }
            }

            mPrevVideoPacketsLost = stats.videoPacketsLost;
            mPrevVideoPacketsRcvd = stats.videoPacketsReceived;

            //calculate video bandwidth
            mVideoBw = (long) ((8 * (stats.videoBytesReceived - mPrevVideoBytes)) / (videoTimestamp - mPrevVideoTimestamp));

            mPrevVideoTimestamp = videoTimestamp;
            mPrevVideoBytes = stats.videoBytesReceived;

            // Log.i(LOGTAG, "Video bandwidth (bps): " + mVideoBw + " Video Bytes received: " + stats.videoBytesReceived + " Video packet lost: " + stats.videoPacketsLost + " Video packet loss ratio: " + mVideoPLRatio);

        }
    }

    private void checkVideoQuality(Promise promise) {

        //  Log.i(LOGTAG, "checkVideoQuality -- ");

        if (mSession != null) {
            //   Log.i(LOGTAG, "Check video quality stats data");


            //   Log.i(LOGTAG, "mVideoBw = " + mVideoBw);
            //   Log.i(LOGTAG, "mVideoPLRatio = " + mVideoPLRatio);

            if (mVideoBw < 150000 || mVideoPLRatio > 0.03) { //POOR
                // Log.i(LOGTAG, "Voice-only - Your bandwidth is too low for video");
                //Log.i(LOGTAG, "Test Result - POOR");

                promise.resolve("BAD: Voice-only - Your bandwidth is too low for video");
            } else if (mVideoBw > 900000 || mVideoPLRatio < 0.005) { //Excellent

                //Log.i (LOGTAG, "Test Result - GOOD Excellent ");

                promise.resolve("GOOD: Voice-only - excellent network");
            } else {
                // Log.i(LOGTAG, "Test Result - AVERAGE");
                promise.resolve("AVERAGE:  All good - okay ");
            }

            mSession.disconnect();
            mPublisher.setPublishVideo(false);
            mSubscriber.setSubscribeToVideo(false);
            mSubscriber.setVideoStatsListener(null);

            mSession = null;

            mStartTestTime = 0;
            mVideoBw = 0;
            mVideoPLRatio = 0;

            mPrevVideoPacketsLost = 0;
            mPrevVideoPacketsRcvd = 0;
            mPrevVideoTimestamp = 0;
            mPrevVideoBytes = 0;
        }
    }
}
