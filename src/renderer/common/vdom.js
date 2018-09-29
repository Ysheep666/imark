export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
export const isVNode = node => typeof node === 'object' && hasOwn(node, 'componentOptions');

export default {
  hasOwn,
  isVNode,
};
