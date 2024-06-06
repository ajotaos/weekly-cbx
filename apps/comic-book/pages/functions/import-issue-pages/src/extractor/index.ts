import { fileTypeFromStream } from 'file-type';

import { ReReadable } from 'rereadable-stream';

import { createReadStream } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Open } from 'unzipper';
import { createExtractorFromFile } from './utils/rar-file-extractor';

import type { ReadStream } from 'node:fs';
import type { Readable } from 'node:stream';

export type CreateExtractorProps = {
	body: Readable;
};

export async function createExtractor(props: CreateExtractorProps) {
	const body = props.body.pipe(new ReReadable());

	const mime = await fileMimeTypeFromStream(body.rewind());
	const iterator = getSupportedIterator(mime);

	return {
		async *files() {
			const temporaryPath = await mkdtemp(join(tmpdir(), '/'));

			const filePath = join(temporaryPath, 'compressed');
			await writeFile(filePath, body.rewind());

			const extractedPath = join(temporaryPath, 'extracted');
			await mkdir(extractedPath);

			yield* iterator(filePath, extractedPath);

			await rm(temporaryPath, { recursive: true, force: true });
		},
	};
}

async function fileMimeTypeFromStream(body: Readable) {
	return fileTypeFromStream(body).then(
		(file) => file?.mime ?? 'application/octet-stream',
	);
}

function getSupportedIterator(mime: string) {
	const iterator = iterators[mime];
	if (iterator === undefined) {
		throw new UnsupportedFileFormatError();
	}

	return iterator;
}

const iterators = {
	'application/x-rar-compressed': iterateRarFiles,
	'application/zip': iterateZipFiles,
} as Record<
	string,
	(
		path: string,
		extractedPath: string,
	) => AsyncGenerator<
		{
			compressedSize: number;
			uncompressedSize: number;
			stream(): ReadStream;
		},
		void,
		unknown
	>
>;

async function* iterateRarFiles(path: string, extractedPath: string) {
	const extractor = await createExtractorFromFile({
		filepath: path,
		targetPath: extractedPath,
	});

	const files = Array.from(extractor.extract().files)
		.filter((file) => !file.fileHeader.flags.directory)
		.toSorted((a, b) =>
			a.fileHeader.name.localeCompare(b.fileHeader.name, 'en'),
		);

	for (const file of files) {
		const extractedFilePath = join(extractedPath, file.fileHeader.name);

		yield {
			compressedSize: file.fileHeader.packSize,
			uncompressedSize: file.fileHeader.unpSize,
			stream() {
				return createReadStream(extractedFilePath);
			},
		};
	}
}

async function* iterateZipFiles(path: string, extractedPath: string) {
	const directory = await Open.file(path);

	await directory.extract({ path: extractedPath });

	const files = directory.files
		.filter((file) => file.type === 'File')
		.toSorted((a, b) => a.path.localeCompare(b.path, 'en'));

	for (const file of files) {
		const extractedFilePath = join(extractedPath, file.path);
		yield {
			compressedSize: file.compressedSize,
			uncompressedSize: file.uncompressedSize,
			stream() {
				return createReadStream(extractedFilePath);
			},
		};
	}
}

export class UnsupportedFileFormatError extends Error {
	constructor() {
		super('Unsupported file format. Only ZIP and RAR formats are supported.');

		this.name = 'UnsupportedFileFormatError';
	}
}
