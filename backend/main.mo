import Hash "mo:base/Hash";

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";

actor {
  type Msg = {
    id: Text;
    author: Principal;
    content: Text;
    timestamp: Time.Time;
    replies: [Text];
    likes: Nat;
    shares: Nat;
  };

  type UserProfile = {
    username: Text;
  };

  stable var msgs : [(Text, Msg)] = [];
  stable var nextMsgId : Nat = 0;
  stable var userProfiles : [(Principal, UserProfile)] = [];

  var msgStore = HashMap.HashMap<Text, Msg>(0, Text.equal, Text.hash);
  var userProfileStore = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);

  system func preupgrade() {
    msgs := Iter.toArray(msgStore.entries());
    userProfiles := Iter.toArray(userProfileStore.entries());
  };

  system func postupgrade() {
    msgStore := HashMap.fromIter<Text, Msg>(msgs.vals(), 0, Text.equal, Text.hash);
    userProfileStore := HashMap.fromIter<Principal, UserProfile>(userProfiles.vals(), 0, Principal.equal, Principal.hash);
  };

  func generateMsgId() : Text {
    nextMsgId += 1;
    Nat.toText(nextMsgId)
  };

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
      replies = [];
      likes = 0;
      shares = 0;
    };

    msgStore.put(id, newMsg);
    #ok(newMsg)
  };

  public query func getTimeline() : async [Msg] {
    Iter.toArray(msgStore.vals())
  };

  public query func getUserProfile(userId : Principal) : async ?UserProfile {
    userProfileStore.get(userId)
  };

  public shared(msg) func updateUserProfile(username : Text) : async () {
    let caller = msg.caller;
    let profile : UserProfile = { username = username };
    userProfileStore.put(caller, profile);
  };

  public shared(msg) func likeMsg(msgId : Text) : async Result.Result<Msg, Text> {
    switch (msgStore.get(msgId)) {
      case (null) { #err("Msg not found") };
      case (?existingMsg) {
        let updatedMsg = {
          id = existingMsg.id;
          author = existingMsg.author;
          content = existingMsg.content;
          timestamp = existingMsg.timestamp;
          replies = existingMsg.replies;
          likes = existingMsg.likes + 1;
          shares = existingMsg.shares;
        };
        msgStore.put(msgId, updatedMsg);
        #ok(updatedMsg)
      };
    }
  };

  public shared(msg) func shareMsg(msgId : Text) : async Result.Result<Msg, Text> {
    switch (msgStore.get(msgId)) {
      case (null) { #err("Msg not found") };
      case (?existingMsg) {
        let updatedMsg = {
          id = existingMsg.id;
          author = existingMsg.author;
          content = existingMsg.content;
          timestamp = existingMsg.timestamp;
          replies = existingMsg.replies;
          likes = existingMsg.likes;
          shares = existingMsg.shares + 1;
        };
        msgStore.put(msgId, updatedMsg);
        #ok(updatedMsg)
      };
    }
  };

  public shared(msg) func replyToMsg(msgId : Text, replyContent : Text) : async Result.Result<Msg, Text> {
    if (Text.size(replyContent) == 0 or Text.size(replyContent) > 280) {
      return #err("Reply must be between 1 and 280 characters");
    };

    switch (msgStore.get(msgId)) {
      case (null) { #err("Msg not found") };
      case (?existingMsg) {
        let replyId = await createMsg(replyContent);
        switch (replyId) {
          case (#err(e)) { #err(e) };
          case (#ok(reply)) {
            let updatedReplies = Array.append<Text>(existingMsg.replies, [reply.id]);
            let updatedMsg = {
              id = existingMsg.id;
              author = existingMsg.author;
              content = existingMsg.content;
              timestamp = existingMsg.timestamp;
              replies = updatedReplies;
              likes = existingMsg.likes;
              shares = existingMsg.shares;
            };
            msgStore.put(msgId, updatedMsg);
            #ok(updatedMsg)
          };
        }
      };
    }
  };
}
