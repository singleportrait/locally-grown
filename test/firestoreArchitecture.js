"users" {
  user_123: {
    displayName: "Jenn"
  },
  user_456: {},
  mod_user_123,
  mod_user_456
},

"events" { // Collection
  "hot-irons": {
    allowedViewers: 100,
    registeredViewers: 0,
    registrationUpdatedAt: Date.lastUpdated() // For tracking when users update the registeredViewers
    adminIds: ["mod_user_123", "mod_user_456"],
    "registeredInfo": { // Sub-collection; you have to be registered to view this
      hot-irons: {
        videoId: "20958k23n5kj125"
      }
    },
    "members": { // Sub-collection
      user_123: {
        registeredAt: Date.now();
      },
      user_456: {
        registeredAt: Date.yesterday();
      }
    }
  }
}
