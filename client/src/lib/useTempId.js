const STORAGE_PARSE = /([a-z0-9]{10});(\d{13})/;

function save(roomId, tempId) {
	const EOL = Date.now() + 24 * 60 * 60 * 1000;
	localStorage.setItem(`tempid_${roomId}`, btoa(`${tempId};${EOL}`));
}

function parse(roomId) {
	const item = atob(localStorage.getItem(`tempid_${roomId}`) || '');
	let [_, tempId, EOL] = STORAGE_PARSE.exec(item) || [];
	EOL = parseInt(EOL) || null;
	tempId ??= null;
	return [tempId, EOL];
}

export default function useTempId(roomId, tempId = null) {
	let EOL;
	if (tempId) {
		save(roomId, tempId);
	} else {
		[tempId, EOL] = parse(roomId);
		if (!tempId || !EOL || Date.now() > EOL) {
			localStorage.removeItem(`tempid_${roomId}`);
			tempId = null;
		} else save(roomId, tempId);
	}
	setTimeout(() => {
		for (const [k, v] of Object.entries(localStorage)) {
			if (k.startsWith('tempid_') || k.startsWith('id_room_')) {
				const parsed = STORAGE_PARSE.exec(atob(v));
				if (!parsed) {
					localStorage.removeItem(k);
					continue;
				}
				const EOL = parseInt(parsed[2]);
				if (EOL && Date.now() > EOL) localStorage.removeItem(k);
			}
		}
	}, 0);
	return tempId;
}
