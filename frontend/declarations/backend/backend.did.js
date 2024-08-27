export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Msg = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : Time,
  });
  const Result = IDL.Variant({ 'ok' : Msg, 'err' : IDL.Text });
  const UserProfile = IDL.Record({ 'username' : IDL.Text });
  return IDL.Service({
    'createMsg' : IDL.Func([IDL.Text], [Result], []),
    'getTimeline' : IDL.Func([], [IDL.Vec(Msg)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'updateUserProfile' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
