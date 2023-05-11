const CaseInsensitiveFilterPlugin = () => {
	return {
		fn: {
			opsFilter: (taggedOps, phrase) => {
				return taggedOps.filter((_tagObject, tag) =>
					tag.toLowerCase().includes(phrase.toLowerCase()),
				);
			},
		},
	};
};

export const swaggerOptions = {
	docExpansion: "list",
	filter: true,
	showRequestDuration: true,
	persistAuthorization: true,
	plugins: [CaseInsensitiveFilterPlugin],
	operationsSorter: (
		a: { get: (argument0: string) => string },
		b: { get: (argument0: string) => string },
	) => {
		const methodsOrder = ["get", "post", "put", "patch", "delete", "options", "trace"];
		let result = methodsOrder.indexOf(a.get("method")) - methodsOrder.indexOf(b.get("method"));

		if (result === 0) {
			result = a.get("path").localeCompare(b.get("path"));
		}

		return result;
	},
};
