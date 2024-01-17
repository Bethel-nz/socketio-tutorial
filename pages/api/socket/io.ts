import type { Server as HTTPServerType } from 'http';
import { Server as NetServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';
import { Server } from 'socket.io';
import axios from 'axios';

interface SocketServer extends HTTPServerType {
	io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
	server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
	socket: SocketWithIO;
}
export const config = {
	api: {
		bodyParser: false,
	},
};

const ioHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
	const path = '/api/socket/io';
	const httpServer: NetServer = res.socket.server;
	const io = new Server(httpServer, {
		path,
		addTrailingSlash: false,
	});
	res.socket.server.io = io;

	io.on('connection', (socket) => {
		console.log('*a user connected');
		socket.on('message', (message, roomName) => {
			try {
				if (roomName.length) {
					io.to(roomName).emit('message', message);
				} else {
					io.emit('message', message);
				}
			} catch (error) {
				console.error(error);
			}
		});
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
		socket.on('joinroom', (roomName) => {
			console.log('joined room', roomName);
			socket.join(roomName);
		});
		socket.on('get-data', async () => {
			try {
				const fetchData = async () => {
					console.time('axiosRequest');
					const res = await fetch(
						'https://jsonplaceholder.typicode.com/todos/1'
					);
					console.timeEnd('axiosRequest');
					return res.json();
				};

				const data = await fetchData();
				console.log(data);
				io.emit('get-data', data);
			} catch (error) {
				console.error(error);
			}
		});
	});

	res.end();
};

export default ioHandler;
