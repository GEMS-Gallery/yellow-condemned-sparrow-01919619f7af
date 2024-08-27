import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : Tweet } |
  { 'err' : string };
export type Time = bigint;
export interface Tweet {
  'id' : string,
  'content' : string,
  'author' : Principal,
  'timestamp' : Time,
}
export interface UserProfile { 'username' : string }
export interface _SERVICE {
  'createTweet' : ActorMethod<[string], Result>,
  'getTimeline' : ActorMethod<[], Array<Tweet>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'updateUserProfile' : ActorMethod<[string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
