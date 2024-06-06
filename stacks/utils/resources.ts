export function resourceIdFactory(service: string) {
	return (id: string) => service + id;
}
