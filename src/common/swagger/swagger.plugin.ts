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
};
