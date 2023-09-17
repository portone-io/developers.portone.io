// https://github.com/whatwg/html/issues/639#issuecomment-252716663
export function doublePushAndBack(url: string) {
  history.pushState({}, "", url);
  history.pushState({}, "", url);
  history.back();
}
