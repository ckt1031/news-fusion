import {} from 'next';

declare global {
	// type RecursivePartial<T> = {
	// 	[P in keyof T]?: RecursivePartial<T[P]>;
	// };

	// type NonNullable<T> = Exclude<T, null | undefined>;  // Remove null and undefined from T

	type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
}
