import React, { PropTypes, Component } from 'react';
// import { FormattedMessage } from 'react-intl';

export class AdsIframe extends Component {
  // constructor(props) {
  //   super(props);
  // }
  static propTypes = {
    handlerCloseAds: PropTypes.func.isRequired,
    channelID: PropTypes.string.isRequired,
  };
  componentDidMount() {
    this.requestAds();
  }
  onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    const self = this;
    function onAdEvent(adEvent) {
      self.onAdEvent(adEvent);
    }
    function onAdError(adErrorEvent) {
      self.onAdError(adErrorEvent);
    }
    this.adsManager = adsManagerLoadedEvent.getAdsManager(this.videoContent);  // should be set to the content video element
    // Add listeners to the required events.
    this.adsManager.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
    // adsManager.addEventListener(
    //   google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    //   this.onContentPauseRequested);
    // adsManager.addEventListener(
    //   google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    //   this.onContentResumeRequested);
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent);

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.LOADED,
      onAdEvent);
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.STARTED,
      onAdEvent);
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.COMPLETE,
      onAdEvent);
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.CLICK,
      onAdEvent);
    this.adsManager.addEventListener(
      window.google.ima.AdEvent.Type.USER_CLOSE,
      onAdEvent);

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(document.getElementById('adContainer').clientWidth, document.getElementById('adContainer').clientHeight, window.google.ima.ViewMode.NORMAL);
      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      // this.videoContent.play();
    }
  }
  onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    switch (adEvent.type) {
      case window.google.ima.AdEvent.Type.LOADED:
        // console.log('loaded', Date.now());
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        // eventAdsense.doneLoad();
        break;
      case window.google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        // console.log('start', Date.now());
        break;
      case window.google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        this.closeAds();
        break;
      case window.google.ima.AdEvent.Type.CLICK:
        this.closeAds();
        break;
      case window.google.ima.AdEvent.Type.USER_CLOSE:
        this.closeAds();
        break;
      default: console.log('default');
    }
  }
  onAdError(adErrorEvent) {
    console.log(adErrorEvent.getError());
    this.closeAds();
  }
  requestAds() {
    const self = this;
    function onAdsManagerLoaded(adsManagerLoadedEvent) {
      self.onAdsManagerLoaded(adsManagerLoadedEvent);
    }
    function onAdError(adErrorEvent) {
      self.onAdError(adErrorEvent);
    }
    // Create the ad display container.
    // Initialize the container. Must be done via a user action on mobile devices.
    this.videoContent = document.getElementById('contentElement');
    this.adDisplayContainer = new window.google.ima.AdDisplayContainer(document.getElementById('adContainer'));
    this.adDisplayContainer.initialize();
    // Create ads loader.
    this.adsLoader = new window.google.ima.AdsLoader(this.adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    this.adsLoader.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
    this.adsLoader.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);

    // Request video ads.
    const adsRequest = new window.google.ima.AdsRequest();
    adsRequest.adTagUrl = `https://googleads.g.doubleclick.net/pagead/ads?ad_type=text_image_flash&client=ca-games-pub-8167045239596974&description_url=${window.location.href.split('?')[0]}&channel=${this.props.channelID}&videoad_start_delay=0&hl=en&max_ad_duration=30000`;
    console.log(adsRequest.adTagUrl);
    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = document.getElementById('adContainer').clientWidth;
    adsRequest.linearAdSlotHeight = document.getElementById('adContainer').clientHeight;

    adsRequest.nonLinearAdSlotWidth = document.getElementById('adContainer').clientWidth;
    adsRequest.nonLinearAdSlotHeight = document.getElementById('adContainer').clientHeight;

    this.adsLoader.requestAds(adsRequest);
  }
  closeAds() {
    this.props.handlerCloseAds();
  }
  adsManager = null;
  adsLoader = null;
  adDisplayContainer = null;
  videoContent = null;
  render() {
    return (
      <div className="adContainer" id="adContainer"></div>
    );
  }
}

// Actions required to provide data for this component to render in sever side.

// Retrieve data from store as props
export default AdsIframe;
