const assert = require("assert");
const firebase = require("@firebase/testing");

const MY_PROJECT_ID = "locally-grown-tv";
const myId = "user_12345";
const modId = "user_mod";
const theirId = "user_67890";
const myAuth = {
  uid: myId,
  email: "user_12345@gmail.com"
};

const eventPath = "events/event_123";
const timestamp = firebase.firestore.FieldValue.serverTimestamp();

function getFirestore(auth) {
  return firebase.initializeTestApp({projectId: MY_PROJECT_ID, auth: auth}).firestore();
}

/* Sudo admin app for creating documents to test with */
function getAdminFirestore() {
  return firebase.initializeAdminApp({projectId: MY_PROJECT_ID}).firestore();
}

/* Clear Firestore before running each test */
beforeEach(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
});

describe("Tutorial tests", () => {
  it("Understands basic addition", () => {
    assert.equal(2+2, 4);
  })

  /* Read-only collection */
  it("Can read items in the read-only collection", async() => {
    const db = getFirestore(null);
    const testDoc = db.collection("readonly").doc("testDoc");
    await firebase.assertSucceeds(testDoc.get());
  });

  it("Can't write items in the read-only collection", async() => {
    const db = getFirestore(null);
    const testDoc = db.collection("readonly").doc("testDoc");
    await firebase.assertFails(testDoc.set({food: "bart"}));
  });

  /* User collection */
  it("Can write to a user document with the same ID as our user", async() => {
    const db = getFirestore(myAuth);
    const userDoc = db.collection("users").doc(myId);
    await firebase.assertSucceeds(userDoc.set({
      cat: "Ed"
    }));
  });

  it("Can't write to a user document with a different ID as our user", async() => {
    const db = getFirestore(myAuth);
    const userDoc = db.collection("users").doc(theirId);
    await firebase.assertFails(userDoc.set({
      cat: "Ed"
    }));
  });

  /* Posts tutorial collection */
  it("Can read posts if they are marked public", async() => {
    const db = getFirestore(null);
    const testQuery = db.collection("posts").where("visibility", "==", "public");
    await firebase.assertSucceeds(testQuery.get());
  });

  it("Can read a single public post", async() => {
    const admin = getAdminFirestore();
    const postId = "public_post";
    const setupDoc = admin.collection("posts").doc(postId);
    await setupDoc.set({authorId: theirId, visibility: "public"});

    const db = getFirestore(null);
    const testRead = db.collection("posts").doc(postId);
    await firebase.assertSucceeds(testRead.get());
  });

  it("Can read a private post belonging to the user", async() => {
    const admin = getAdminFirestore();
    const postId = "private_post";
    const setupDoc = admin.collection("posts").doc(postId);
    await setupDoc.set({authorId: myId, visibility: "private"});

    const db = getFirestore(myAuth);
    const testRead = db.collection("posts").doc(postId);
    await firebase.assertSucceeds(testRead.get());
  });

  it("Can't read a private post belonging to another user", async() => {
    const admin = getAdminFirestore();
    const postId = "private_post";
    const setupDoc = admin.collection("posts").doc(postId);
    await setupDoc.set({authorId: theirId, visibility: "private"});

    const db = getFirestore(myAuth);
    const testRead = db.collection("posts").doc(postId);
    await firebase.assertFails(testRead.get());
  });
});

/* Begin real app tests! */
/* --------------------------------------------------------------------------*/

/* User security */
describe("User security", () => {
  it("Allows a user to edit their own user info", async() => {
    const admin = getAdminFirestore();
    await admin.collection("users").doc(myId).set({
      content: "before"
    });

    const db = getFirestore(myAuth);
    const testDoc = db.collection("users").doc(myId);
    await firebase.assertSucceeds(testDoc.update({content: "after"}));
  });

  it("Doesn't allow a user to edit any other users' info", async() => {
    const admin = getAdminFirestore();
    await admin.collection("users").doc(theirId).set({
      content: "before"
    });

    const db = getFirestore(myAuth);
    const testDoc = db.collection("users").doc(theirId);
    await firebase.assertFails(testDoc.update({content: "after"}));
  });
})

/* Events security */
/* --------------------------------------------------------------------------*/
describe("Event security", () => {
  it("Allows anyone to view an event", async() => {
    const db = getFirestore();
    const testEvent = db.doc(eventPath);
    await firebase.assertSucceeds(testEvent.get());
  });

  it("Allows a user to view an event", async() => {
    const memberPath = `${eventPath}/members/${theirId}`;
    const admin = getAdminFirestore();

    const db = getFirestore(myAuth);
    const testEvent = db.doc(eventPath);
    await firebase.assertSucceeds(testEvent.get());
  });

  it("Allows a moderator to update any field on an event", async() => {
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
      adminIds: [myId, "dummy_mod_123"]
    });

    const db = getFirestore(myAuth);
    const testEvent = db.doc(eventPath);
    await firebase.assertSucceeds(testEvent.update({
      totalAllowed: 110
    }));
  });

  it("Doesn't allow a user to update unallowed field on an event", async() => {
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
    });

    const db = getFirestore(myAuth);
    const testEvent = db.doc(eventPath);
    await firebase.assertFails(testEvent.update({
      totalAllowed: 110
    }));
  });

  it("Doesn't allow a moderator to change the total viewers to less than the currently registered viewers", async() => {
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 99,
      adminIds: [myId, "dummy_mod_123"]
    });

    const db = getFirestore(myAuth);
    const testEvent = db.doc(eventPath);
    // const data = await testEvent.get();
    // console.log(`Test event total allowed: \n ${data.data().totalAllowed}`);
    await firebase.assertFails(testEvent.update({
      totalAllowed: 90
    }));
  });
});

  /* Events registration & viewing security */
/* --------------------------------------------------------------------------*/
describe("Event registration security", () => {
  it("Allows a user to register for an event only if updating registration count", async() => {
    const memberPath = `${eventPath}/members/${myId}`;
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
    });

    const db = getFirestore(myAuth);
    const testMember = db.doc(memberPath);
    const testEvent = db.doc(eventPath);

    const batch = db.batch();
    batch.set(testMember, {
      registeredAt: timestamp
    });
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(1),
      registrationUpdatedAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Allows a user to *un*register for an event only if updating registration count", async() => {
    const memberPath = `${eventPath}/members/${myId}`;
    const admin = getAdminFirestore();
    let date = new Date(timestamp);
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 2,
      adminIds: [theirId, "mod_123"],
      registrationUpdatedAt: date.setDate(date.getDate() - 1)
    });
    await admin.doc(memberPath).set({
      registeredAt: timestamp
    });

    const db = getFirestore(myAuth);
    const testMember = db.doc(memberPath);
    const testEvent = db.doc(eventPath);
    const batch = db.batch();
    batch.delete(testMember);
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(-1),
      registrationUpdatedAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Doesn't allow a user to register if the registration is full", async() => {
    const memberPath = `${eventPath}/members/${myId}`;
    const admin = getAdminFirestore();
    let date = new Date(timestamp);
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 100,
    });

    const db = getFirestore(myAuth);
    const testMember = db.doc(memberPath);
    const testEvent = db.doc(eventPath);

    const batch = db.batch();
    batch.set(testMember, {
      registeredAt: timestamp
    });
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(1),
      registrationUpdatedAt: timestamp
    });

    await firebase.assertFails(batch.commit());
  });

  it("Allows a moderator to remove a member from an event", async() => {
    const memberPath = `${eventPath}/members/${theirId}`;
    const admin = getAdminFirestore();
    let date = new Date(timestamp);
    await admin.doc(eventPath).set({
      adminIds: [myId, "dummy_mod_123"],
      totalAllowed: 100,
      totalRegistered: 2,
      registrationUpdatedAt: date.setDate(date.getDate() - 1)
    });
    await admin.doc(memberPath).set({
      registeredAt: timestamp
    });

    const db = getFirestore(myAuth);
    const testMember = db.doc(memberPath);
    const testEvent = db.doc(eventPath);
    const batch = db.batch();
    batch.delete(testMember);
    batch.update(testEvent, {
      totalRegistered: firebase.firestore.FieldValue.increment(-1),
      registrationUpdatedAt: timestamp
    });
    await firebase.assertSucceeds(batch.commit());
  });

  it("Doesn't allow a user to register for an event without updating registration count & timestamp", async() => {
    const memberPath = `${eventPath}/members/${myId}`;
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      totalAllowed: 100,
      totalRegistered: 0,
    });

    const db = getFirestore(myAuth);
    const testEvent = db.doc(eventPath);
    const testMember = db.doc(memberPath);
    const batch = db.batch();
    batch.set(testMember, {
      registeredAt: timestamp
    });
    await firebase.assertFails(batch.commit());
  });

  it("Doesn't allow a user to register for an event with missing fields", async() => {
    const memberPath = `${eventPath}/members/${myId}`;

    const db = getFirestore(myAuth);
    const testDoc = db.doc(memberPath);
    await firebase.assertFails(testDoc.set({
      content: "after",
    }));
  });

  it("Allows a user to edit their own event registration", async() => {
    const memberPath = `${eventPath}/members/${myId}`;
    const admin = getAdminFirestore();
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: Date.now()
    });

    const db = getFirestore(myAuth);
    const testMember = db.doc(memberPath);
    await firebase.assertSucceeds(testMember.update({content: "after"}));
  });

  it("Doesn't allow a user to edit somebody else's event registration", async() => {
    const memberPath = `${eventPath}/members/${theirId}`;
    const admin = getAdminFirestore();
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: Date.now()
    });

    const db = getFirestore(myAuth);
    const testDoc = db.doc(memberPath);
    await firebase.assertFails(testDoc.update({content: "after"}));
  });

  it("Doesn't allow a user to view somebody else's event registration", async() => {
    const memberPath = `${eventPath}/members/${theirId}`;
    const admin = getAdminFirestore();
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: Date.now()
    });

    const db = getFirestore(myAuth);
    const testDoc = db.doc(memberPath);
    await firebase.assertFails(testDoc.get());
  });

  it("Allows a moderator to edit somebody else's event registration", async() => {
    const memberPath = `${eventPath}/members/${theirId}`;
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });
    await admin.doc(memberPath).set({
      content: "before",
      registeredAt: timestamp
    });

    const db = getFirestore(myAuth);
    const testDoc = db.doc(memberPath);
    await firebase.assertSucceeds(testDoc.update({content: "after"}));
  });

  it("Allows a moderator to get the list of users on an event", async() => {
    const admin = getAdminFirestore();
    await admin.doc(eventPath).set({
      adminIds: [myId, "dummy_mod_123"],
      registrationUpdatedAt: timestamp
    });

    const db = getFirestore(myAuth);
    const testEventMembers = db.doc(eventPath).collection("members");
    await firebase.assertSucceeds(testEventMembers.get());
  });

  it("Doesn't allow a non-moderator to get the list of users on an event", async() => {
    const db = getFirestore(myAuth);
    const testEventMembers = db.doc(eventPath).collection("members");
    await firebase.assertFails(testEventMembers.get());
  });
});

/* Clear Firestore after running these tests */
after(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
});
