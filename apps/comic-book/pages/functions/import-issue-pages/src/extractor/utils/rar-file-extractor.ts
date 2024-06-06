import { readFileSync } from 'node:fs';

import { ExtractorFile } from 'node-unrar-js/esm/js/ExtractorFile';
import { getUnrar } from 'node-unrar-js/esm/js/unrar.singleton';

import type { Extractor } from 'node-unrar-js/esm/js/Extractor';

const wasmBinary = readFileSync(
	require.resolve('node-unrar-js/esm/js/unrar.wasm'),
);

export interface ExtractorFromFileOptions {
	filepath: string;
	targetPath?: string;
	password?: string;
	filenameTransform?: (filename: string) => string;
}

export async function createExtractorFromFile({
	filepath,
	targetPath = '',
	password = '',
	filenameTransform = (filename: string) => filename,
}: ExtractorFromFileOptions): Promise<Extractor> {
	const unrar = await getUnrar({ wasmBinary });
	const extractor = new ExtractorFile(
		unrar,
		filepath,
		targetPath,
		password,
		filenameTransform,
	);
	unrar.extractor = extractor;
	return extractor;
}
