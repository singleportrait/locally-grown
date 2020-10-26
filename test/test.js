const assert = require("assert");
const firebase = require("@firebase/testing");

const MY_PROJECT_ID = "locally-grown-tv";
const myId = "user_12345";
const theirId = "user_67890";
const myAuth = {uid: myId, email: "user_12345@gmail.com"};

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

describe("LGtv Screening app", () => {
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

/* Clear Firestore after running these tests */
after(async() => {
  await firebase.clearFirestoreData({projectId: MY_PROJECT_ID});
});
