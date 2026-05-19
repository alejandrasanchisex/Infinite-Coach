const data = { media: [{id: 'sys-rec-1', title: 'test'}] };
const SYSTEM_MEDIA = [{id: 'sys-rec-2', title: 'test2'}];

const update = (id, updates) => {
    let index = data.media.findIndex(m => m.id == id);
    if (index >= 0) {
        data.media[index] = { ...data.media[index], ...updates };
    } else if (String(id).startsWith('sys-')) {
        const sysItem = (SYSTEM_MEDIA || []).find(m => m.id == id);
        if (sysItem) {
            data.media.push({ ...sysItem, ...updates, id: id });
        }
    }
    return true;
};

update('sys-rec-2', { title: 'updated' });
console.log(data.media);
