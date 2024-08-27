export const idlFactory = ({ IDL }) => {
  const Category = IDL.Variant({
    'All' : IDL.Null,
    'News' : IDL.Null,
    'Crypto' : IDL.Null,
    'Other' : IDL.Null,
    'Sports' : IDL.Null,
  });
  const Time = IDL.Int;
  const Msg = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'shares' : IDL.Nat,
    'author' : IDL.Principal,
    'likes' : IDL.Nat,
    'timestamp' : Time,
    'replies' : IDL.Vec(IDL.Text),
    'category' : Category,
  });
  const Result = IDL.Variant({ 'ok' : Msg, 'err' : IDL.Text });
  const UserProfile = IDL.Record({ 'username' : IDL.Text });
  return IDL.Service({
    'createMsg' : IDL.Func([IDL.Text, Category], [Result], []),
    'getMsgsByCategory' : IDL.Func([Category], [IDL.Vec(Msg)], ['query']),
    'getTimeline' : IDL.Func([], [IDL.Vec(Msg)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'likeMsg' : IDL.Func([IDL.Text], [Result], []),
    'replyToMsg' : IDL.Func([IDL.Text, IDL.Text, Category], [Result], []),
    'shareMsg' : IDL.Func([IDL.Text], [Result], []),
    'updateUserProfile' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
