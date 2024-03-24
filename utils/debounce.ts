export function debounce(func: Function, wait: number = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return function () {
    // @ts-ignore
    const context = this;
    const args = arguments;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
