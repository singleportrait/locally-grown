"users" {
  user_123: {
    displayName: "Jenn"
  },
  user_456: {},
  mod_user_123,
  mod_user_456
},

"screening" { // Collection
  "hot-irons": {
    totalAllowed: 100,
    totalRegistered: 0,
    registrationUpdatedAt: Date.lastUpdated() // For tracking when users update the registeredViewers
    adminIds: ["mod_user_123", "mod_user_456"],
    "registeredInfo": { // Sub-collection; you have to be registered to view this
      hot-irons: {
        videoId: "20958k23n5kj125"
      }
    },
    "members": { // Sub-collection
      user_123: {
        registeredAt: Date.now(),
        payments: [
          {
            id: "1nv55T5Jpn..",
            amount: 1000,
            created: Date.now()
          }
          {
            id: "2MFZ8L79T...",
            ...
          }
        ]
      },
      user_456: {
        registeredAt: Date.yesterday();
      }
    }
  }
}
