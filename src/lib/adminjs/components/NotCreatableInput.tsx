import React from "react";
import { BasePropertyComponent, EditPropertyProps } from "adminjs";

const NotCreatableInput: React.FC<EditPropertyProps> = props => {
	const { property, record: initialRecord } = props;
	const cleanProperty = React.useMemo(
		() => ({ ...property, components: {} }),
		[property],
	);

	const BaseComponent = BasePropertyComponent as any;

	if (initialRecord?.id) {
		cleanProperty.isDisabled = false;

		return <BaseComponent {...props} property={cleanProperty} />;
	}

	cleanProperty.isDisabled = true;

	return <BaseComponent {...props} property={cleanProperty} isDisabled />;
};

export default NotCreatableInput;
