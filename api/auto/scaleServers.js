import config from '../../config/config.js';
import { getLinodeInstances, increaseLinodeCount, decreaseLinodeCount } from '../helpers/servers.js';

const mode = process.argv[2];
const username = process.env.USERNAME || process.env.USER || process.env.LOGNAME;
const serverCount = parseInt(process.argv[3]) || 0;

const user = {
	id       : 2,
	name     : 'Jon Bruschke',
	email    : 'jbruschke@gmail.com',
	greeting : 'Duuuuuude!',
};

if (username === 'palmer') {
	user.id = 1;
	user.name = 'Chris Palmer';
	user.email = 'palmer@tabroom.com';
	user.greeting = `Well, that's unfortunate`;
} else if (username === 'hardy') {
	user.id = 3;
	user.name = 'Aaron Hardy';
	user.email = 'aaron.hardy@speechanddebate.org';
	user.greeting = `Piss off`;
}

if (mode === 'show') {

	const showInstances = async () => {

		const tabroomMachines = await getLinodeInstances();

		console.log('\x1b[34m%s\x1b[0m', `\nTabroom Machine Current Status\n`);

		tabroomMachines.forEach( (machine) => {

			let label = machine.label;
			if (label !== 'tabroom-replica' && label !== 'tabroom-db') {
				label = `${machine.label}\t`;
			}

			let consoleColor = '';

			console.log('\x1b[4m%s\x1b[0m',`${label}\tID:\t${machine.linode_id} \t\tState: \t${machine.status}\t\tType: \t${machine.type}\t\tIPv4: \t${machine.ipv4} \t\tCPUs:\t${machine.specs.vcpus}`);

			if (machine.loadOne > (machine.specs.vcpus * 2)) {
				consoleColor = '\x1b[31m%s\x1b[0m';
			} else if (machine.loadOne > machine.specs.vcpus) {
				consoleColor = '\x1b[33m%s\x1b[0m';
			} else {
				consoleColor = '\x1b[32m%s\x1b[0m';
			}

			console.log(consoleColor, `\t\tCPU Load: \t${machine.loadOne} / ${machine.loadFive} / ${machine.loadFifteen}`);

			const free = {
				memory: (machine.memory * 100).toFixed(1),
				swap: (machine.swap * 100).toFixed(1),
			};

			['memory', 'swap'].forEach( (tag) => {
				if (free[tag] < 5) {
					consoleColor = '\x1b[31m%s\x1b[0m';
				} else if (free[tag] < 15) {
					consoleColor = '\x1b[33m%s\x1b[0m';
				} else {
					consoleColor = '\x1b[32m%s\x1b[0m';
				}

				console.log(consoleColor, `\t\tFree ${tag}: \t${free[tag]}%`);
			});

			if (machine.tags.includes(config.LINODE.WEBHOST_BASE)) {
				let masonString = '\t\tMason Dockers\t';
				let indexString = '\t\tIDX Dockers\t';

				[1,2,3,4].forEach( (tick) => {
					masonString = `${masonString}${tick}: ${machine.mason[`${tick}`]?.status} ${machine.mason[`${tick}`]?.checkStatus}\t`;
					indexString = `${indexString}${tick}: ${machine.indexcards[`${tick}`]?.status} ${machine.indexcards[`${tick}`]?.checkStatus}\t`;
				});

				console.log(masonString);
				console.log(indexString);
			}

			console.log(` `);
		});
	};

	await showInstances();
	process.exit();

} else if (mode === 'json') {

	const showInstanceJSON = async () => {
		const tabroomMachines = await getLinodeInstances();
		console.log(JSON.stringify(tabroomMachines));
	};

	await showInstanceJSON();
	process.exit();

} else if (mode === 'increase') {

	const changeInstances = async () => {
		console.log(`Increasing instance count by ${serverCount}`);
		const response = await increaseLinodeCount(user, serverCount);
		console.log(`Change command issued.  Response was`);
		console.log(JSON.stringify(response));
	};

	await changeInstances();
	process.exit();

} else if (mode === 'decrease') {

	const decreaseInstances = async () => {
		console.log(`Decreasing instance count by ${serverCount}`);
		const response = await decreaseLinodeCount(user, serverCount);
		console.log(`Change command issued.  Response was`);
		console.log(JSON.stringify(response));
	};

	await decreaseInstances();
	process.exit();

} else {

	console.log(`USAGE:  node scaleServers.js  [show | json | increase | decrease ]  [changeCount]`);
}

process.exit();
