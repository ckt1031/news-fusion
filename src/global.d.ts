import {} from 'next';

declare global {
	type RecursivePartial<T> = {
		[P in keyof T]?: RecursivePartial<T[P]>;
	};

	type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
}
