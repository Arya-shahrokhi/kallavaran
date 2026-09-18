/** whitelist صریح فیلدها؛ محافظت در برابر Mass Assignment. */
export const pick = (source = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
