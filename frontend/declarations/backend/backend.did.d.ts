import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Msg {
  'id' : string,
  'content' : string,
  'author' : Principal,
  'timestamp' : Time,
}
export type Result = { 'ok' : Msg } |
  { 'err' : string };
export type Time = bigint;
export interface UserProfile { 'username' : string }
export interface _SERVICE {
  'createMsg' : ActorMethod<[string], Result>,
  'getTimeline' : ActorMethod<[], Array<Msg>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'updateUserProfile' : ActorMethod<[string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
