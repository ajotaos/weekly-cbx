import { join } from 'node:path';

export function pathsFactory(service: string, stack: string) {
	const basePath = join('apps', service, stack);

	return {
		makeFunctionPath(filename: string) {
			return join(basePath, 'functions', filename, 'src', 'index.main');
		},
	};
}
