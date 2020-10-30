const assert = require("assert");
const firebase = require("@firebase/testing");

const MY_PROJECT_ID = "locally-grown-tv";
const myId = "user_12345";
const modId = "user_mod";
const godId = "user_god";
const theirId = "user_67890";

const screeningId = "screening_123";

const myAuth = {
  uid: myId,
  displayName: "Jenn Scheer",
  email: "user_12345@gmail.com"
};

const theirAuth = {
  uid: theirId,
  displayName: "Jamil Baldwin",
  email: "user_67890@gmail.com"
};

const modAuth = {
  uid: modId,
  email: "user_mod@gmail.com"
};

const godAuth = {
  uid: modId,
  email: "mod_user_123@gmail.com",
  roles: ["godMod"]
};

const screeningPath = `screenings/${screeningId}`;

const timestamp = firebase.firestore.FieldValue.serverTimestamp();
let date = new Date(timestamp);
const yesterday = date.setDate(date.getDate() - 1);

function getFirestore(auth) {
  return firebase.initializeTestApp({projectId: MY_PROJECT_ID, auth: auth}).firestore();
}

/* Sudo admin app for creating documents to test with */
function getAdminFirestore() {
  return firebase.initializeAdminApp({projectId: MY_PROJECT_ID}).firestore();
}

const admin = getAdminFirestore();

const noAuthDB = getFirestore(null);
const myAuthDB = getFirestore(myAuth);
const modAuthDB = getFirestore(modAuth);
const godAuthDB = getFirestore(godAuth);

/* Clear Firestore before running each test */
beforeEach(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
});

/* Begin real app tests! */
/* --------------------------------------------------------------------------*/

/* User security */
describe("User security", () => {
  it("Allows a user to edit their own user info", async() => {
    await admin.collection("users").doc(myId).set({
      content: "before"
    });

    const testUser = myAuthDB.collection("users").doc(myId);
    await firebase.assertSucceeds(testUser.update({content: "after"}));
  });

  it("Doesn't allow a user to edit any other users' info", async() => {
    await admin.collection("users").doc(theirId).set({
      content: "before"
    });

    const testUser = myAuthDB.collection("users").doc(theirId);
    await firebase.assertFails(testUser.update({content: "after"}));
  });
})

/* Events security */
/* --------------------------------------------------------------------------*/
describe("Event security", () => {
  it("Allows anyone to view a screening", async() => {
    const testEvent = noAuthDB.doc(screeningPath);
    await firebase.assertSucceeds(testEvent.get());
  });

  it("Allows a user to view a screening", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;

    const testEvent = myAuthDB.doc(screeningPath);
    await firebase.assertSucceeds(testEvent.get());
  });

  it("Allows a moderator to update any field on a screening", async() => {
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
      adminIds: [myId, "dummy_mod_123"]
    });

    const testEvent = myAuthDB.doc(screeningPath);
    await firebase.assertSucceeds(testEvent.update({
      totalAllowed: 110
    }));
  });

  it("Doesn't allow a user to update unallowed field on a screening", async() => {
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
    });

    const testEvent = myAuthDB.doc(screeningPath);
    await firebase.assertFails(testEvent.update({
      totalAllowed: 110
    }));
  });

  it("Doesn't allow a moderator to change the total viewers to less than the currently registered viewers", async() => {
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 99,
      adminIds: [myId, "dummy_mod_123"]
    });

    const testEvent = myAuthDB.doc(screeningPath);
    // const data = await testEvent.get();
    // console.log(`Test screening total allowed: \n ${data.data().totalAllowed}`);
    await firebase.assertFails(testEvent.update({
      totalAllowed: 90
    }));
  });

  it("Allows a ~~god mod~~ (user for now) to create a screening with all required fields", async() => {
    // const testEvent = godAuthDB.doc(screeningPath);
    const testEvent = myAuthDB.doc(screeningPath);
    await firebase.assertSucceeds(testEvent.set({
      totalAllowed: 100,
      totalRegistered: 0,
      registrationUpdatedAt: timestamp,
      adminIds: []
    }));
  });

  // it("Doesn't allow a user to create a screening", async() => {
  // });

  it("Doesn't allow a ~~god mod~~ (user for now) with missing fields to create a screening", async() => {
    // const testEvent = godAuthDB.doc(screeningPath);
    const testEvent = myAuthDB.doc(screeningPath);
    await firebase.assertFails(testEvent.set({
      totalAllowed: 100,
      totalRegistered: 0,
      registrationUpdatedAt: timestamp
    }));
  });
});

  /* Events registration & viewing security */
/* --------------------------------------------------------------------------*/
describe("Event registration security", () => {
  it("Allows a user to register for a screening only if updating registration info", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
      registrationUpdatedAt: yesterday
    });

    const testMember = myAuthDB.doc(memberPath);
    const testEvent = myAuthDB.doc(screeningPath);

    const batch = myAuthDB.batch();
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(1),
      registrationUpdatedAt: timestamp
    });
    batch.set(testMember, {
      displayName: myAuth.displayName,
      email: myAuth.email,
      registeredAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Allows a user to unregister for a screening only if updating registration info", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    const admin = getAdminFirestore();
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 2,
      adminIds: [theirId, "mod_123"],
      registrationUpdatedAt: yesterday
    });
    await admin.doc(memberPath).set({
      displayName: myAuth.displayName,
      email: myAuth.email,
      registeredAt: timestamp
    });

    const testMember = myAuthDB.doc(memberPath);
    const testEvent = myAuthDB.doc(screeningPath);

    const batch = myAuthDB.batch();
    batch.delete(testMember);
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(-1),
      registrationUpdatedAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Doesn't allow a user to register if the registration is full", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    const admin = getAdminFirestore();
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 100,
    });

    const testMember = myAuthDB.doc(memberPath);
    const testEvent = myAuthDB.doc(screeningPath);

    const batch = myAuthDB.batch();
    batch.set(testMember, {
      registeredAt: timestamp
    });
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(1),
      registrationUpdatedAt: timestamp
    });

    await firebase.assertFails(batch.commit());
  });

  it("Allows a moderator to remove a member from a screening", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;
    const admin = getAdminFirestore();
    await admin.doc(screeningPath).set({
      adminIds: [myId, "dummy_mod_123"],
      totalAllowed: 100,
      totalRegistered: 2,
      registrationUpdatedAt: yesterday
    });
    await admin.doc(memberPath).set({
      registeredAt: timestamp
    });

    const testMember = myAuthDB.doc(memberPath);
    const testEvent = myAuthDB.doc(screeningPath);

    const batch = myAuthDB.batch();
    batch.delete(testMember);
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(-1),
      registrationUpdatedAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Doesn't allow a user to register for a screening without updating registration count & timestamp", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    await admin.doc(screeningPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
    });

    const testMember = myAuthDB.doc(memberPath);

    const batch = myAuthDB.batch();
    batch.set(testMember, {
      registeredAt: timestamp
    });
    await firebase.assertFails(batch.commit());
  });

  it("Doesn't allow a user to register for a screening with missing fields", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;

    const testMember = myAuthDB.doc(memberPath);
    await firebase.assertFails(testMember.set({
      content: "after",
    }));
  });

  it("Allows a user to edit their own screening registration", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    await admin.doc(memberPath).set({
      content: "before",
    });

    const testMember = myAuthDB.doc(memberPath);
    await firebase.assertSucceeds(testMember.update({content: "after"}));
  });

  it("Doesn't allow a user to edit somebody else's screening registration", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: timestamp
    });

    const testMember = myAuthDB.doc(memberPath);
    await firebase.assertFails(testMember.update({content: "after"}));
  });

  it("Doesn't allow a user to view somebody else's screening registration", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: timestamp
    });

    const testMember = myAuthDB.doc(memberPath);
    await firebase.assertFails(testMember.get());
  });

  it("Allows a moderator to edit somebody else's screening registration", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;
    await admin.doc(screeningPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: timestamp
    });

    const testMember = myAuthDB.doc(memberPath);
    await firebase.assertSucceeds(testMember.update({content: "after"}));
  });

  it("Allows a moderator to get the list of users on a screening", async() => {
    await admin.doc(screeningPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });

    const testEventMembers = myAuthDB.doc(screeningPath).collection("members");
    await firebase.assertSucceeds(testEventMembers.get());
  });

  it("Doesn't allow a non-moderator to get the list of users on a screening", async() => {
    const testEventMembers = myAuthDB.doc(screeningPath).collection("members");
    await firebase.assertFails(testEventMembers.get());
  });
});

/* Event registered-only info */
/* --------------------------------------------------------------------------*/
describe("Event registered-only info", () => {
  it("Allows registered viewers to see registered-only info", async() => {
    const memberPath = `${screeningPath}/members/${myId}`;
    await admin.doc(memberPath).set({
      registeredAt: timestamp
    });

    const testRegisteredInfo = myAuthDB.doc(screeningPath).collection("registeredInfo");
    await firebase.assertSucceeds(testRegisteredInfo.get());
  });

  it("Allows moderators to see registered-only info", async() => {
    const memberPath = `${screeningPath}/members/${theirId}`;
    await admin.doc(screeningPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });
    await admin.doc(memberPath).set({
      registeredAt: timestamp
    });

    const testRegisteredInfo = myAuthDB.doc(screeningPath).collection("registeredInfo");
    await firebase.assertSucceeds(testRegisteredInfo.get());
  });

  it("Doesn't allow non-registered non-moderator users to see registered-only info", async() => {
    const testRegisteredInfo = myAuthDB.doc(screeningPath).collection("registeredInfo");
    await firebase.assertFails(testRegisteredInfo.get());
  });

  it("Allows moderators to update registered-only info", async() => {
    await admin.doc(screeningPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });

    const registeredInfoPath = `${screeningPath}/registeredInfo/${screeningId}`;
    const testRegisteredInfoDoc = myAuthDB.doc(registeredInfoPath);
    await firebase.assertSucceeds(testRegisteredInfoDoc.set({
      videoId: "12345"
    }));
  });

  it("Doesn't allow non-moderators to update registered-only info", async() => {
    const registeredInfoPath = `${screeningPath}/registeredInfo/${screeningId}`;
    const testRegisteredInfoDoc = myAuthDB.doc(registeredInfoPath);
    await firebase.assertFails(testRegisteredInfoDoc.set({
      videoId: "12345"
    }));
  });
});

/* Clear Firestore after running these tests */
after(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
});
