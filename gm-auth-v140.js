// Destiny GM Admin authentication bootstrap v1.40
// Keeps the GM session isolated while explicitly supporting Supabase magic-link callbacks.
(()=>{
'use strict';
if(!window.supabase?.createClient)return;
const originalCreateClient=window.supabase.createClient.bind(window.supabase);
window.supabase.createClient=(url,key,options={})=>{
  const auth={
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true,
    flowType:'implicit',
    ...(options.auth||{}),
    storageKey:'destiny-gm-admin-auth'
  };
  const client=originalCreateClient(url,key,{...options,auth});
  // Explicit fallback for magic links that return access/refresh tokens in the URL hash.
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const access_token=hash.get('access_token');
  const refresh_token=hash.get('refresh_token');
  if(access_token&&refresh_token){
    client.auth.setSession({access_token,refresh_token}).then(({error})=>{
      if(error){console.error('GM callback session error',error);return;}
      history.replaceState({},document.title,location.pathname+location.search);
    });
  }
  return client;
};
})();