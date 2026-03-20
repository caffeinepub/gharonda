import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Types
  type PropertyType = {
    #apartment;
    #villa;
    #plot;
    #commercial;
  };

  type PropertyStatus = {
    #available;
    #sold;
  };

  type Property = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    propertyType : PropertyType;
    bedrooms : Nat;
    bathrooms : Nat;
    areaSqFt : Nat;
    imageIds : [Storage.ExternalBlob];
    sellerId : Principal;
    status : PropertyStatus;
    createdAt : Int;
  };

  type Message = {
    id : Nat;
    propertyId : Nat;
    senderId : Principal;
    receiverId : Principal;
    content : Text;
    timestamp : Int;
    isRead : Bool;
  };

  type ConversationKey = {
    propertyId : Nat;
    user1 : Principal;
    user2 : Principal;
  };

  type UserProfile = {
    name : Text;
    role : Text; // "buyer" or "seller" - application-specific role
  };

  // Helper modules for comparison
  module Property {
    public func compare(p1 : Property, p2 : Property) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  module ConversationKey {
    public func compare(a : ConversationKey, b : ConversationKey) : Order.Order {
      switch (Nat.compare(a.propertyId, b.propertyId)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) {
          switch (Principal.compare(a.user1, b.user1)) {
            case (#equal) { Principal.compare(a.user2, b.user2) };
            case (order) { order };
          };
        };
      };
    };
  };

  module Message {
    public func compare(a : Message, b : Message) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // Persistent state
  let properties = Map.empty<Nat, Property>();
  let messages = Map.empty<Nat, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextPropertyId = 1;
  var nextMessageId = 1;

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if user is a seller
  func isSeller(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (?profile) { profile.role == "seller" };
      case (null) { false };
    };
  };

  // Property management
  public shared ({ caller }) func createProperty(property : Property) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create properties");
    };
    
    // Check if user is a seller (application-specific role)
    if (not isSeller(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only sellers can create properties");
    };

    let newId = nextPropertyId;
    let now = Time.now();
    let newProperty : Property = {
      property with
      id = newId;
      sellerId = caller;
      createdAt = now;
    };
    properties.add(newId, newProperty);
    nextPropertyId += 1;
    newId;
  };

  public shared ({ caller }) func updateProperty(id : Nat, property : Property) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update properties");
    };

    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property not found") };
      case (?existing) {
        if (existing.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the property owner or admin can update");
        };
        let updated : Property = { property with id; sellerId = existing.sellerId };
        properties.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProperty(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete properties");
    };

    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the property owner or admin can delete");
        };
        properties.remove(id);
      };
    };
  };

  // Public read operations - no authentication required
  public query func getAllProperties() : async [Property] {
    properties.values().toArray().sort();
  };

  public query func getPropertiesBySeller(sellerId : Principal) : async [Property] {
    properties.values().toArray().filter(func(p) { p.sellerId == sellerId });
  };

  public query func getPropertiesByType(propertyType : PropertyType) : async [Property] {
    properties.values().toArray().filter(func(p) { p.propertyType == propertyType });
  };

  public query func getPropertiesByLocation(location : Text) : async [Property] {
    properties.values().toArray().filter(func(p) { Text.equal(p.location, location) });
  };

  public query func filterProperties(
    location : ?Text,
    propertyType : ?PropertyType,
    minBedrooms : ?Nat,
    maxPrice : ?Nat,
  ) : async [Property] {
    properties.values().toArray().filter(
      func(p) {
        switch (location) {
          case (?loc) { if (not Text.equal(p.location, loc)) { return false } };
          case (null) {};
        };
        switch (propertyType) {
          case (?t) { if (p.propertyType != t) { return false } };
          case (null) {};
        };
        switch (minBedrooms) {
          case (?min) { if (p.bedrooms < min) { return false } };
          case (null) {};
        };
        switch (maxPrice) {
          case (?max) { if (p.price > max) { return false } };
          case (null) {};
        };
        true;
      }
    );
  };

  // Messaging system
  public shared ({ caller }) func sendMessage(
    propertyId : Nat,
    receiverId : Principal,
    content : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    // Verify the property exists
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?_) {};
    };

    let newId = nextMessageId;
    let now = Time.now();

    let newMessage : Message = {
      id = newId;
      propertyId;
      senderId = caller;
      receiverId;
      content;
      timestamp = now;
      isRead = false;
    };

    messages.add(newId, newMessage);
    nextMessageId += 1;
    newId;
  };

  public query ({ caller }) func getConversation(
    propertyId : Nat,
    otherParty : Principal,
  ) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view conversations");
    };

    messages.values().toArray().filter(
      func(m) {
        m.propertyId == propertyId and
        ((m.senderId == caller and m.receiverId == otherParty) or
         (m.senderId == otherParty and m.receiverId == caller))
      }
    );
  };

  public shared ({ caller }) func markMessageAsRead(messageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark messages as read");
    };

    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        if (msg.receiverId != caller) {
          Runtime.trap("Unauthorized: Only the receiver can mark as read");
        };
        let updated : Message = {
          msg with
          isRead = true;
        };
        messages.add(messageId, updated);
      };
    };
  };

  public query ({ caller }) func getUserConversations() : async [(Nat, Principal, Principal)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view conversations");
    };

    let conversationSet = Map.empty<ConversationKey, Bool>();

    messages.values().toArray().forEach(
      func(m) {
        if (m.senderId == caller or m.receiverId == caller) {
          let otherUser = if (m.senderId == caller) { m.receiverId } else { m.senderId };
          let key : ConversationKey = {
            propertyId = m.propertyId;
            user1 = if (Principal.compare(caller, otherUser) == #less) { caller } else { otherUser };
            user2 = if (Principal.compare(caller, otherUser) == #less) { otherUser } else { caller };
          };
          conversationSet.add(key, true);
        };
      }
    );

    conversationSet.keys().toArray().map(
      func(key) {
        let otherUser = if (key.user1 == caller) { key.user2 } else { key.user1 };
        (key.propertyId, caller, otherUser)
      }
    );
  };
};
