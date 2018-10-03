// So where do:
// Channel
// Program
// fit into this?

<Channel>
  // Handle edge cases around not having programs, etc.
  <Program>
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
  </Program>
</Channel>


// Mobile
<Program>
  <VideoControls show="fullscreen" />
  <Navigation />
  <MobileChannelInfo />
    // Or <MuteControl />
  <PreviousChannel />
  <Video />
  <VideoControls show="mute" />
    // Or <FullscreenControl />
  <MobileProgramInfo />
  <NextChannel />
  <ProgramMobileTitle />
</Program>


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
