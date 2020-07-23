import * as path from 'path';

export const docFolder = path.resolve(__dirname, '../docs');
export const demografieFile = path.resolve(docFolder, 'demografie.xlsx');
export const demografieOutput = path.resolve(__dirname, '../../gui/src/assets', 'demografie.json');
export const ziekenhuizenFolder = path.resolve(docFolder, 'ziekenhuizen');
export const ziekenhuisInputFile = path.resolve(docFolder, 'Ziekenhuislocaties.xlsx');
export const ziekenhuisGeojson = path.resolve(__dirname, '../../gui/src/assets', 'ziekenhuizen.json');
export const aanrijdGeojson25 = path.resolve(__dirname, '../../gui/src/assets', 'aanrijden25.json');
export const aanrijdGeojson30 = path.resolve(__dirname, '../../gui/src/assets', 'aanrijden30.json');
