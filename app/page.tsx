'use client';
import { useCallback, useEffect, useState } from 'react';

import React from 'react';
import io, { Socket } from 'socket.io-client';

export default function Home() {
	const [socket, setSocket] = useState<Socket | any>();
	const [inbox, setInbox] = useState<string[]>([]);
	const [message, setMessage] = useState('');
	const [roomName, setRoomName] = useState('');

	const handleSendMessage = () => {
		socket.emit('message', message, roomName);
	};

	const handleJoinRoom = () => {
		socket.emit('joinroom', roomName);
	};

	useEffect(() => {
		const socket = new (io as any)('http://localhost:3000', {
			path: '/api/socket/io',
			addTrailingSlash: false,
		});

		const handleMessage = (message: string) => {
			setInbox((prevInbox: any) => [...prevInbox, message]);
		};

		const handleGetData = async (data: any) => {
			console.log('Recieved Data', data);
		};
		const fetchData = () => {
			socket.emit('get-data');
		};

		socket.on('get-data', (data: string) => {
			console.log('Recieved data:', data);
		});

		const ticker = setInterval(() => {
			fetchData;
		}, 500);

		socket.on('message', handleMessage);
		setSocket(socket);
		return () => {
			socket.off('message', handleMessage);
			socket.disconnect();
			clearInterval(ticker);
		};
	}, []);

	return (
		<div>
			<div className='flex flex-col gap-5 mt-20 px-10 lg:px-48'>
				<button
					onClick={() => {
						socket.emit('get-data');
					}}
					className='border rounded-lg w-24 py-2'
				>
					fetch data
				</button>
				<span>
					<span></span>
				</span>
				<div className='flex flex-col gap-2 border rounded-lg p-10'>
					{inbox.map((message: string, index: number) => (
						<div key={index} className='border rounded px-4 py-2'>
							{message}
						</div>
					))}
				</div>
				<div className='flex gap-2 align-center justify-center'>
					<input
						type='text'
						name='message'
						className='flex-1 bg-black border rounded px-2 py-1'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button className='w-40' onClick={handleSendMessage}>
						Send Message
					</button>
				</div>
				<div className='flex gap-2 align-center justify-center'>
					<input
						type='text'
						name='room'
						className='flex-1 bg-black border rounded px-2 py-1'
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
					/>
					<button className='w-40' onClick={handleJoinRoom}>
						Join Room
					</button>
				</div>
			</div>
		</div>
	);
}
