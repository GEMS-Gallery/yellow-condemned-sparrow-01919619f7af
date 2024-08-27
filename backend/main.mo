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
  type Msg = {
    id: Text;
    author: Principal;
    content: Text;
    timestamp: Time.Time;
  };

  type UserProfile = {
    username: Text;
  };

  // Stable storage
  stable var msgs : [(Text, Msg)] = [];
  stable var nextMsgId : Nat = 0;
  stable var userProfiles : [(Principal, UserProfile)] = [];

  // In-memory storage
  var msgStore = HashMap.HashMap<Text, Msg>(0, Text.equal, Text.hash);
  var userProfileStore = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);

  // Initialize in-memory storage from stable storage
  system func preupgrade() {
    msgs := Iter.toArray(msgStore.entries());
    userProfiles := Iter.toArray(userProfileStore.entries());
  };

  system func postupgrade() {
    msgStore := HashMap.fromIter<Text, Msg>(msgs.vals(), 0, Text.equal, Text.hash);
    userProfileStore := HashMap.fromIter<Principal, UserProfile>(userProfiles.vals(), 0, Principal.equal, Principal.hash);
  };

  // Helper function to generate a unique msg ID
  func generateMsgId() : Text {
    nextMsgId += 1;
    return Nat.toText(nextMsgId);
  };

  // Create a new msg
  public shared(msg) func createMsg(content : Text) : async Result.Result<Msg, Text> {
    let author = msg.caller;
    if (Text.size(content) == 0 or Text.size(content) > 280) {
      return #err("Msg must be between 1 and 280 characters");
    };

    let id = generateMsgId();
    let newMsg : Msg = {
      id = id;
      author = author;
      content = content;
      timestamp = Time.now();
    };

    msgStore.put(id, newMsg);
    #ok(newMsg)
  };

  // Get the timeline (all msgs)
  public query func getTimeline() : async [Msg] {
    let buffer = Buffer.Buffer<Msg>(0);
    for ((_, msg) in msgStore.entries()) {
      buffer.add(msg);
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
