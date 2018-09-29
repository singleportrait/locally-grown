<div className={column}>
  <Video />
  <VideoControls />
  <NextChannel />
  <PreviousChannel />
</div>
<div className={column}>
  <Navigation />
  <ProgramInfo />
</div>


// Mobile
<VideoControls show="mute" />
<PreviousChannel />
<Video />
<VideoControls show="fullscreen" />
<NextChannel />
<ProgramMobileTitle />


<TVGuide>
  <TVGuideRow>
  </TVGuideRow>
</TVGuide>


<Channels>
  <IndexChannel location="left">
  </IndexChannel>
  <IndexChannel location="center">
  </IndexChannel>
  <IndexChannel location="right">
  </IndexChannel>
</Channels>
