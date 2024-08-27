import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Category = { 'All' : null } |
  { 'News' : null } |
  { 'Crypto' : null } |
  { 'Other' : null } |
  { 'Sports' : null };
export interface Msg {
  'id' : string,
  'content' : string,
  'shares' : bigint,
  'author' : Principal,
  'likes' : bigint,
  'timestamp' : Time,
  'replies' : Array<string>,
  'category' : Category,
}
export type Result = { 'ok' : Msg } |
  { 'err' : string };
export type Time = bigint;
export interface UserProfile { 'username' : string }
export interface _SERVICE {
  'createMsg' : ActorMethod<[string, Category], Result>,
  'getMsgsByCategory' : ActorMethod<[Category], Array<Msg>>,
  'getTimeline' : ActorMethod<[], Array<Msg>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'likeMsg' : ActorMethod<[string], Result>,
  'replyToMsg' : ActorMethod<[string, string, Category], Result>,
  'shareMsg' : ActorMethod<[string], Result>,
  'updateUserProfile' : ActorMethod<[string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
