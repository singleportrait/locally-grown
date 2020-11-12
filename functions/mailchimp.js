const functions = require('firebase-functions');
const md5 = require('md5');

const mailchimp = require("@mailchimp/mailchimp_marketing");
mailchimp.setConfig({
  apiKey: functions.config().mailchimp.key,
  server: "us18"
});

const listId = "81c8d59bc1";

const updateTag = async (subscriberHash, tagName, status) => {
  try {
    const tagResponse = await mailchimp.lists.updateListMemberTags(
      listId,
      subscriberHash,
      {
        body: {
          tags: [
            {
              name: tagName,
              status: status, // Set this to "inactive" when untagging
            },
          ],
        },
      }
    );
    // console.log("Successfully updated tag");
  } catch (error) {
    functions.logger.error("Error tagging user", error.message);
  }
};

exports.mailchimpScreeningSubscribe = functions.firestore
  .document('/screenings/{screeningId}/members/{userId}')
  .onCreate(async (snap, context) => {
    // functions.logger.info("Subscribing user", context.params.screeningId, context.params.userId);
    // functions.logger.info("Snap data", snap.data());

    const { displayName, email } = snap.data();
    const subscriberHash = md5(email.toLowerCase());

    const tagName = context.params.screeningId;

    /* First check to see if they're subscribed */
    try {
      const response = await mailchimp.lists.getListMember(listId, subscriberHash);
      // Note: We can't 'resubscribe' users that have been manually archived in the admin
      console.log(`This user's subscription status is ${response.status}.`);

      if (response.status === "unsubscribed") {
        console.log("Resubscribing...", subscriberHash);
        try {
          const response = await mailchimp.lists.updateListMember(
            listId,
            subscriberHash,
            {
              status: "subscribed",
            }
          );

        } catch (error) {
          functions.logger.error("Error updating user status", error.message);
        }
      }

      updateTag(subscriberHash, tagName, "active");

    } catch (error) {
      /* Mailchimp returns an `error` if it doesn't find a member in the list */

      // console.error(`This email is not subscribed to this list`);

      try {
        const response = await mailchimp.lists.addListMember(listId, {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: displayName
          }
        });
        // console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);

        updateTag(subscriberHash, tagName, "active");

      } catch (error) {
        functions.logger.error("Error subscribing user", error.message);
      }
    }
  });

exports.mailchimpScreeningUnsubsribe = functions.firestore
  .document('/screenings/{screeningId}/members/{userId}')
  .onDelete(async (snap, context) => {
    // functions.logger.info("Member is unregistering");
    // functions.logger.info("Snap data", snap.data());

    const subscriberHash = md5(snap.data().email.toLowerCase());
    const tagName = context.params.screeningId;

    updateTag(subscriberHash, tagName, "inactive");
  });
