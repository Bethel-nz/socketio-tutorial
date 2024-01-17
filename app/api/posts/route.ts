import { NextResponse } from 'next/server';


export const GET = async () => {
	console.time('fetchRequest');
	const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
	const response = await res.json();
	console.timeEnd('fetchRequest');

	return NextResponse.json(response);
};
