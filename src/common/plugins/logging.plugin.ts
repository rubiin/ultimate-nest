import { Plugin } from '@nestjs/graphql';
import {
	ApolloServerPlugin,
	GraphQLRequestListener,
} from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
	requestDidStart(): GraphQLRequestListener {
		console.info('Request started');
		return {
			willSendResponse() {
				console.info('Will send response');
			},
		};
	}
}
