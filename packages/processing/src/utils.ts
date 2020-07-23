export const sumProduct = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays are not equal');
  }
  return arr1.reduce((acc, cur, i) => acc + cur * arr2[i], 0);
};
