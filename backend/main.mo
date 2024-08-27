import Hash "mo:base/Hash";
import Nat "mo:base/Nat";

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";

actor {
  // Types
  type Tweet = {
    id: Text;
    author: Principal;
    content: Text;
    timestamp: Time.Time;
  };

  type UserProfile = {
    username: Text;
  };

  // Stable storage
  stable var tweets : [(Text, Tweet)] = [];
  stable var nextTweetId : Nat = 0;
  stable var userProfiles : [(Principal, UserProfile)] = [];

  // In-memory storage
  var tweetStore = HashMap.HashMap<Text, Tweet>(0, Text.equal, Text.hash);
  var userProfileStore = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);

  // Initialize in-memory storage from stable storage
  system func preupgrade() {
    tweets := Iter.toArray(tweetStore.entries());
    userProfiles := Iter.toArray(userProfileStore.entries());
  };

  system func postupgrade() {
    tweetStore := HashMap.fromIter<Text, Tweet>(tweets.vals(), 0, Text.equal, Text.hash);
    userProfileStore := HashMap.fromIter<Principal, UserProfile>(userProfiles.vals(), 0, Principal.equal, Principal.hash);
  };

  // Helper function to generate a unique tweet ID
  func generateTweetId() : Text {
    nextTweetId += 1;
    return Nat.toText(nextTweetId);
  };

  // Create a new tweet
  public shared(msg) func createTweet(content : Text) : async Result.Result<Tweet, Text> {
    let author = msg.caller;
    if (Text.size(content) == 0 or Text.size(content) > 280) {
      return #err("Tweet must be between 1 and 280 characters");
    };

    let id = generateTweetId();
    let tweet : Tweet = {
      id = id;
      author = author;
      content = content;
      timestamp = Time.now();
    };

    tweetStore.put(id, tweet);
    #ok(tweet)
  };

  // Get the timeline (all tweets)
  public query func getTimeline() : async [Tweet] {
    let buffer = Buffer.Buffer<Tweet>(0);
    for ((_, tweet) in tweetStore.entries()) {
      buffer.add(tweet);
    };
    Buffer.toArray(buffer)
  };

  // Get user profile
  public query func getUserProfile(userId : Principal) : async ?UserProfile {
    userProfileStore.get(userId)
  };

  // Create or update user profile
  public shared(msg) func updateUserProfile(username : Text) : async () {
    let caller = msg.caller;
    let profile : UserProfile = { username = username };
    userProfileStore.put(caller, profile);
  };
}
