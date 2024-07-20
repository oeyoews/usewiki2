export default function useUserInfo() {
  const vanillaStatus: IStatus = {
    username: '',
    tiddlywiki_version: '',
  };

  // tiddlywiki status field
  const status = ref<IStatus>(vanillaStatus);

  return {
    status,
  };
}
