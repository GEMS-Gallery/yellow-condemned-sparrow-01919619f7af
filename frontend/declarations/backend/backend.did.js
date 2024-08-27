export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Tweet = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : Time,
  });
  const Result = IDL.Variant({ 'ok' : Tweet, 'err' : IDL.Text });
  const UserProfile = IDL.Record({ 'username' : IDL.Text });
  return IDL.Service({
    'createTweet' : IDL.Func([IDL.Text], [Result], []),
    'getTimeline' : IDL.Func([], [IDL.Vec(Tweet)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'updateUserProfile' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
